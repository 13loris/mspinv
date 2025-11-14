package main

import (
    "encoding/json"
    "log"
    "net/http"
    "os"
    "sync"
    "time"

    "github.com/google/uuid"
)

type Category struct {
    ID   string `json:"id"`
    Name string `json:"name"`
    Description string `json:"description,omitempty"`
}

type InventoryItem struct {
    ID string `json:"id"`
    CategoryID string `json:"category_id"`
    Count int `json:"count"`
    Notes string `json:"notes,omitempty"`
    CreatedAt time.Time `json:"created_at"`
}

var (
    mu sync.Mutex
    categories = []Category{
        { ID: "cat-server", Name: "Server" },
        { ID: "cat-pc", Name: "PC" },
        { ID: "cat-notebook", Name: "Notebook" },
        { ID: "cat-mobile", Name: "Mobiles Endgerät" },
    }
    items = []InventoryItem{}
)

func withCORS(h http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        w.Header().Set("Access-Control-Allow-Origin", "*")
        w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
        w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
        if r.Method == "OPTIONS" {
            w.WriteHeader(http.StatusOK)
            return
        }
        h.ServeHTTP(w, r)
    })
}

func listCategories(w http.ResponseWriter, r *http.Request) {
    mu.Lock()
    defer mu.Unlock()
    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(categories)
}

func createCategory(w http.ResponseWriter, r *http.Request) {
    var c Category
    if err := json.NewDecoder(r.Body).Decode(&c); err != nil {
        http.Error(w, "invalid", http.StatusBadRequest)
        return
    }
    c.ID = uuid.NewString()
    mu.Lock()
    categories = append(categories, c)
    mu.Unlock()
    w.Header().Set("Content-Type", "application/json")
    w.WriteHeader(http.StatusCreated)
    json.NewEncoder(w).Encode(c)
}

func listInventory(w http.ResponseWriter, r *http.Request) {
    mu.Lock()
    defer mu.Unlock()
    w.Header().Set("Content-Type", "application/json")
    if len(items) == 0 {
        w.Write([]byte("[]"))
    } else {
        json.NewEncoder(w).Encode(items)
    }
}

func createInventory(w http.ResponseWriter, r *http.Request) {
    var it InventoryItem
    if err := json.NewDecoder(r.Body).Decode(&it); err != nil {
        http.Error(w, "invalid", http.StatusBadRequest)
        return
    }
    it.ID = uuid.NewString()
    it.CreatedAt = time.Now().UTC()
    mu.Lock()
    items = append(items, it)
    mu.Unlock()
    w.Header().Set("Content-Type", "application/json")
    w.WriteHeader(http.StatusCreated)
    json.NewEncoder(w).Encode(it)
}

func main() {
    mux := http.NewServeMux()
    mux.HandleFunc("/api/categories", func(w http.ResponseWriter, r *http.Request) {
        if r.Method == "GET" { listCategories(w, r); return }
        if r.Method == "POST" { createCategory(w, r); return }
        http.Error(w, "method", http.StatusMethodNotAllowed)
    })
    mux.HandleFunc("/api/inventory", func(w http.ResponseWriter, r *http.Request) {
        if r.Method == "GET" { listInventory(w, r); return }
        if r.Method == "POST" { createInventory(w, r); return }
        http.Error(w, "method", http.StatusMethodNotAllowed)
    })

    port := os.Getenv("PORT")
    if port == "" { port = "8080" }
    addr := ":" + port
    log.Printf("Listening on %s", addr)
    if err := http.ListenAndServe(addr, withCORS(mux)); err != nil {
        log.Fatal(err)
    }
}