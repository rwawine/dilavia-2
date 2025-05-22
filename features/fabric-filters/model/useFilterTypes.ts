import { useMemo } from 'react'

interface Collection {
  name: string
  filterType: string
}

interface Category {
  name: string
  name_ru: string
  collections: Collection[]
}

interface Fabric {
  name: string
  name_ru: string
  collections: Collection[]
}

interface FilterType {
  id: string
  name: string
}

export const useFilterTypes = (fabrics: Fabric[] = []): FilterType[] => {
  return useMemo(() => {
    const filterTypes = new Set<string>()
    
    if (!fabrics?.length) {
      console.log('No fabrics data') // Отладочный вывод
      return []
    }

    // Перебираем все коллекции
    fabrics.forEach(fabric => {
      if (fabric.collections) {
        fabric.collections.forEach((collection: Collection) => {
          if (collection.filterType) {
            console.log('Found filterType:', collection.filterType) // Отладочный вывод
            filterTypes.add(collection.filterType)
          }
        })
      }
    })

    // Преобразуем Set в массив объектов FilterType
    return Array.from(filterTypes).map(type => ({
      id: type,
      name: type
    }))
  }, [fabrics])
} 