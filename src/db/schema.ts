// Previous interfaces remain...

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'denied';

export interface Order {
  id: string;
  warehouseId: string;
  origin: string;
  sender: string;
  items: string; // JSON string of ordered items
  status: OrderStatus;
  sendDate: string;
  createdAt: string;
}