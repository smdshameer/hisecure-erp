export interface DeliveryChallan {
    id: number;
    challanNumber: string;
    createdAt: string;
    type: string;
    status: string;
    customer?: { name: string };
    toWarehouse?: { name: string };
    _count?: { items: number };
}
