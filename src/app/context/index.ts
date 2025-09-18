
import React from "react";

interface IDefaultValues {
    client_margin: number,
    wholesaler_margin: number,
    minimum_quantity: number,
    tva: number,
    transport_fees: number,
    marketing_fees: number,
}

export interface IAppContext {
    defaultValues: IDefaultValues
}

export const Context = React.createContext<IAppContext | any>(null);