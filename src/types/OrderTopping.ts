import { Topping } from "./Topping";
/**
 * 注文トッピングを表す部品用クラス.
 */
export class OrderTopping {
  constructor(
    //ID

    public _id: number,
    //トッピングID
    public _toppingId: number,
    //注文商品ID
    public _orderItemId: number,
    //トッピング
    public _topping: Topping
  ) {}

  public get id(): number {
    return this._id;
  }

  public set id(id: number) {
    this._id = id;
  }

  public get toppingId(): number {
    return this._toppingId;
  }

  public set toppingId(toppingId: number) {
    this._toppingId = toppingId;
  }

  public get orderItemId(): number {
    return this._orderItemId;
  }

  public set orderItemId(orderItemId: number) {
    this._orderItemId = orderItemId;
  }

  public get topping(): Topping {
    return this._topping;
  }

  public set topping(topping: Topping) {
    this._topping = topping;
  }
}
