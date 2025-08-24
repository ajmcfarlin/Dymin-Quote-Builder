export interface CustomLaborItem {
  id: string
  name: string
  price: number
}

export interface OtherLaborData {
  percentage: number // Percentage of support labor to allocate as budget (e.g., 5 = 5%)
  customItems: CustomLaborItem[] // Custom items that subtract from the budget
}