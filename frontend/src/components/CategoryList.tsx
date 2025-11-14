import React from 'react'

export default function CategoryList({categories}:{categories:any}){
  return (
    <ul>
      {categories.map((c:any)=> <li key={c.id}>{c.name}</li>)}
    </ul>
  )
}
