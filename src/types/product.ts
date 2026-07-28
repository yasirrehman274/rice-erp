export type ProductStatus = "active" | "inactive";
export type ProductUnit = "Bag" | "Kg" | "Ton";
export interface Product { id: string; productName: string; riceCode: string; category: string; brand: string; variety: string; unit: ProductUnit; bagWeight: string; lastPurchasePrice: number; suggestedSalePrice: number; minimumStock: number; currentStock: number; warehouseCount: number; description: string; status: ProductStatus; createdDate: string; }
export interface ProductFormValues { productName: string; riceCode: string; category: string; brand: string; variety: string; unit: ProductUnit; bagWeight: string; lastPurchasePrice: string; suggestedSalePrice: string; minimumStock: string; description: string; status: ProductStatus; }
export interface ProductMovement { id: string; date: string; reference: string; party: string; quantity: string; amount: number; status: "Completed" | "Pending"; }
