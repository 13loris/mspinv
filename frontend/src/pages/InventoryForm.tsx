import React, { useEffect, useState } from 'react'

type Category = { id: string; name: string }
type Item = { id: string; category_id: string; count: number; notes?: string }

export default function InventoryForm(){
  const [categories, setCategories] = useState<Category[]>([])
  const [name, setName] = useState('')
  const [items, setItems] = useState<Item[]>([])
  const [selectedCat, setSelectedCat] = useState<string>('')
  const [count, setCount] = useState(1)

  useEffect(()=>{ fetchCats(); fetchItems() }, [])

  async function fetchCats(){
    const res = await fetch('/api/categories')
    const data = await res.json()
    setCategories(data)
    if(data[0]) setSelectedCat(data[0].id)
  }
  async function fetchItems(){
    const res = await fetch('/api/inventory')
    setItems(await res.json())
  }

  async function addCategory(e: React.FormEvent){
    e.preventDefault()
    await fetch('/api/categories', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ name }) })
    setName('')
    fetchCats()
  }

  async function addItem(e: React.FormEvent){
    e.preventDefault()
    await fetch('/api/inventory', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ category_id: selectedCat, count, notes: '' }) })
    setCount(1)
    fetchItems()
  }

  function exportCSV(){
    const rows = items.map(it => {
      const cat = categories.find(c=>c.id===it.category_id)?.name || it.category_id
      return `${cat},${it.count}`
    })
    const csv = 'Category,Count\n' + rows.join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'inventory.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div>
      <section style={{marginBottom:20}}>
        <h3>Kategorie anlegen</h3>
        <form onSubmit={addCategory}>
          <input value={name} onChange={e=>setName(e.target.value)} placeholder="Name" />
          <button type="submit">Hinzufügen</button>
        </form>
      </section>

      <section style={{marginBottom:20}}>
        <h3>Inventar erfassen</h3>
        <form onSubmit={addItem}>
          <label>Kategorie: </label>
          <select value={selectedCat} onChange={e=>setSelectedCat(e.target.value)}>
            {categories.map(c=> <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <label style={{marginLeft:10}}>Anzahl: </label>
          <input type="number" value={count} onChange={e=>setCount(Number(e.target.value))} min={1} />
          <button type="submit">Hinzufügen</button>
        </form>
      </section>

      <section>
        <h3>Liste</h3>
        <table border={1} cellPadding={6}>
          <thead><tr><th>Kategorie</th><th>Anzahl</th></tr></thead>
          <tbody>
            {items.map(it=> (
              <tr key={it.id}><td>{categories.find(c=>c.id===it.category_id)?.name || it.category_id}</td><td>{it.count}</td></tr>
            ))}
          </tbody>
        </table>
        <div style={{marginTop:10}}>
          <button onClick={exportCSV}>Export CSV</button>
        </div>
      </section>
    </div>
  )
}
