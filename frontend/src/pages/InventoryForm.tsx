import React, { useEffect, useState } from 'react'

type Category = { id: string; name: string }
type Item = { id: string; category_id: string; count: number; notes?: string; created_at?: string }

export default function InventoryForm(){
  // Fixed categories — not editable
  const defaultCategories: Category[] = [
    { id: 'cat-server', name: 'Server' },
    { id: 'cat-pc', name: 'PC' },
    { id: 'cat-notebook', name: 'Notebook' },
    { id: 'cat-mobile', name: 'Mobiles Endgerät' },
  ]

  const [categories] = useState<Category[]>(defaultCategories)
  const [items, setItems] = useState<Item[]>([])
  const [selectedCat, setSelectedCat] = useState<string>(defaultCategories[0].id)
  const [count, setCount] = useState(1)

  useEffect(() => { fetchItems() }, [])

  async function fetchItems(){
    try {
      const res = await fetch('/api/inventory')
      if (res.ok) {
        setItems(await res.json())
      }
    } catch (e) {
      console.warn('Could not fetch inventory items')
    }
  }

  async function addItem(e: React.FormEvent){
    e.preventDefault()
    try {
      await fetch('/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category_id: selectedCat, count, notes: '' })
      })
      setCount(1)
      fetchItems()
    } catch (e) {
      console.error('Error adding item:', e)
    }
  }

  async function deleteItem(itemId: string){
    try {
      await fetch(`/api/inventory/${itemId}`, { method: 'DELETE' })
      fetchItems()
    } catch (e) {
      console.error('Error deleting item:', e)
    }
  }

  async function resetAll(){
    const confirmed = window.confirm('Möchten Sie wirklich alle Einträge löschen? Diese Aktion kann nicht rückgängig gemacht werden.')
    if (!confirmed) return
    
    try {
      // Lösche alle Items einzeln (oder implementiere später einen Batch-Endpunkt)
      await Promise.all(items.map(it => fetch(`/api/inventory/${it.id}`, { method: 'DELETE' })))
      fetchItems()
    } catch (e) {
      console.error('Error resetting inventory:', e)
    }
  }

  function exportCSV(){
    const rows = items.map(it => {
      const cat = categories.find(c => c.id === it.category_id)?.name || it.category_id
      return `${cat},${it.count}`
    })
    const csv = 'Kategorie,Anzahl\n' + rows.join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'inventory.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h2>Inventarisierung</h2>

      <section style={{ marginBottom: '30px', padding: '15px', border: '1px solid #ccc', borderRadius: '4px' }}>
        <h3>Inventar erfassen</h3>
        <form onSubmit={addItem}>
          <div style={{ marginBottom: '10px' }}>
            <label>Kategorie: </label>
            <select value={selectedCat} onChange={e => setSelectedCat(e.target.value)} style={{ padding: '5px', marginLeft: '10px' }}>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div style={{ marginBottom: '10px' }}>
            <label>Anzahl: </label>
            <input
              type="number"
              value={count}
              onChange={e => setCount(Math.max(1, Number(e.target.value)))}
              min={1}
              style={{ padding: '5px', marginLeft: '10px', width: '80px' }}
            />
          </div>
          <button type="submit" style={{ padding: '8px 16px', cursor: 'pointer', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '4px' }}>
            Hinzufügen
          </button>
        </form>
      </section>

      <section style={{ marginBottom: '20px' }}>
        <h3>Übersicht</h3>
        {items.length > 0 ? (
          <div>
            <table style={{ borderCollapse: 'collapse', width: '100%', border: '1px solid #ddd' }}>
              <thead style={{ backgroundColor: '#f5f5f5' }}>
                <tr>
                  <th style={{ border: '1px solid #ddd', padding: '10px', textAlign: 'left' }}>Kategorie</th>
                  <th style={{ border: '1px solid #ddd', padding: '10px', textAlign: 'center' }}>Anzahl</th>
                  <th style={{ border: '1px solid #ddd', padding: '10px', textAlign: 'center' }}>Aktion</th>
                </tr>
              </thead>
              <tbody>
                {items.map(it => (
                  <tr key={it.id}>
                    <td style={{ border: '1px solid #ddd', padding: '10px' }}>
                      {categories.find(c => c.id === it.category_id)?.name || it.category_id}
                    </td>
                    <td style={{ border: '1px solid #ddd', padding: '10px', textAlign: 'center' }}>
                      {it.count}
                    </td>
                    <td style={{ border: '1px solid #ddd', padding: '10px', textAlign: 'center' }}>
                      <button
                        onClick={() => deleteItem(it.id)}
                        style={{
                          padding: '4px 8px',
                          cursor: 'pointer',
                          backgroundColor: '#dc3545',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '3px',
                          fontSize: '14px',
                          fontWeight: 'bold'
                        }}
                        title="Zeile löschen"
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
              <button
                onClick={exportCSV}
                style={{ padding: '8px 16px', cursor: 'pointer', backgroundColor: '#28a745', color: '#fff', border: 'none', borderRadius: '4px' }}
              >
                Export CSV
              </button>
              <button
                onClick={resetAll}
                style={{ padding: '8px 16px', cursor: 'pointer', backgroundColor: '#dc3545', color: '#fff', border: 'none', borderRadius: '4px' }}
              >
                Zurücksetzen
              </button>
            </div>
          </div>
        ) : (
          <div style={{ padding: '20px', color: '#999', fontStyle: 'italic' }}>
            Keine Einträge vorhanden. Fügen Sie ein Inventar-Item hinzu.
          </div>
        )}
      </section>
    </div>
  )
}