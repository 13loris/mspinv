import React, { useEffect, useState } from 'react'
import InventoryForm from './pages/InventoryForm'

export default function App() {
  return (
    <div style={{ padding: 20, fontFamily: 'Arial, sans-serif' }}>
      <h2>Inventory MVP</h2>
      <InventoryForm />
    </div>
  )
}
