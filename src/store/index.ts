import Vue from "vue";
import Vuex from "vuex";
import { Item } from "@/types/Item";
import { OrderItem } from "@/types/OrderItem";
import axios from "axios";
import createPersistedState from "vuex-persistedstate";
import { OrderTopping } from "@/types/OrderTopping";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    // ログインされているかどうかのフラグ(ログイン時:true/ログアウト時:false)
    isLogin: false,
    //「注文に進む」をクリックしたかどうかのフラグ(クリック時:true/クリックしていない時:false)
    goOrder: false,
    //全商品情報
    items: new Array<Item>(),
    //カートの商品情報
    cartList: new Array<OrderItem>(),
    //ログインしているユーザID
    userId: "",
  },
  mutations: {
    /**
     * 注文に進むをクリック.
     *
     * @param state ステート
     */
    goOrdered(state) {
      state.goOrder = true;
    },
    /**
     * 注文に進むをクリックしていない時.
     *
     * @param state ステート
     */
    noGoOrdered(state) {
      state.goOrder = false;
    },

    /**
     * ログインする.
     *
     * @param state ステート
     */
    logined(state) {
      state.isLogin = true;
    },
    /**
     * ログアウトする.
     *
     * @param state ステート
     */
    logouted(state) {
      state.isLogin = false;
    },
    /**
     * 商品一覧情報を作成してstateに格納する.
     *
     * @param state ステートオブジェクト
     * @param payload WebAPIから取得した商品情報(JSON)
     */
    showItemList(state, payload) {
      // payloadの中(WebAPIから取得したJSON)のitemsをstateのitemsに代入する
      // state.items = payload.items;
      // 初期化(やらないとアイテム一覧表示するたびに追加されていくため)
      state.items = new Array<Item>();
      for (const item of payload.items) {
        state.items.push(
          new Item(
            item.id,
            item.type,
            item.name,
            item.discription,
            item.priceM,
            item.priceL,
            item.imagePath,
            item.deleted,
            []
          )
        );
      }
      //価格の降順で(安い方が上)並び替え
      state.items.sort(function (boforeItems, afterItems) {
        if (afterItems.priceM > boforeItems.priceM) {
          return -1;
        } else {
          return 1;
        }
      });
    },

    /**
     * カート(state.cartList)に商品を追加する.
     * @param state ステート
     * @param buyItem 買う商品
     */
    addItemToCart(state, buyItem) {
      state.cartList.push(buyItem.OrderItem);
    },
    /**
     * カート(state.cartList)の商品を1件削除.
     * @param state ステート
     * @param index 対象の商品のindex番号
     */
    deleteItem(state, index) {
      state.cartList.splice(index, 1);
    },

    /**
     * ログイン中のユーザIDを取得する.
     */
    loginUserId(state, userId) {
      state.userId = userId;
    },
  }, // end mutations
  actions: {
    /**
     * アイテム一覧情報をWebAPIから取得してmutationを呼び出す.
     * @param context コンテキスト
     */
    async getItemList(context) {
      // WebAPIからアイテム一覧情報を取得する
      const responseItem = await axios.get(
        "http://153.127.48.168:8080/ecsite-api/item/items/toy"
      );
      // 取得したJSONデータをコンソールに出力して確認
      console.dir("response商品情報:" + JSON.stringify(responseItem));
      // 取得したresponseデータの中のdataを取り出してpayload変数に格納する
      const payload = responseItem.data;
      // showEmployeeListという名前のミューテーションを呼び出す
      // (contextオブジェクトのcommitメソッドを呼び出す)
      // その際、先程payload変数に格納したデータを第２引数に渡す
      context.commit("showItemList", payload);
    },
  }, //end actions
  getters: {
    /**
     * 注文に進むをクリックした状態を返す.
     *
     * @param state ステート
     * @returns ture:クリック済/false:クリックしていない
     */
    getGoOrderStatus(state) {
      return state.goOrder;
    },
    /**
     * ログイン状態を返す.
     *
     * @param state ステート
     * @returns ture:ログイン済/false:ログアウト済
     */
    getLoginStatus(state) {
      return state.isLogin;
    },
    /**
     * 全アイテム情報を返す.
     * @param state ステート
     * @returns 全アイテム情報
     */
    getItemList(state) {
      return state.items;
    },
    /**
     * カート情報を返す.
     * @param state ステート
     * @returns カートの商品情報
     */
    getCartList(state) {
      const array = new Array<OrderItem>();

      for (const orderItem of state.cartList) {
        const toppingArray = new Array<OrderTopping>();
        for (const item of orderItem._orderToppingList) {
          toppingArray.push(
            new OrderTopping(
              item._id,
              item._toppingId,
              item._orderItemId,
              item._topping
            )
          );
        }
        array.push(
          new OrderItem(
            orderItem._id,
            orderItem._itemId,
            orderItem._orderId,
            orderItem._quantity,
            orderItem._size,
            new Item(
              orderItem._item._id,
              orderItem._item._type,
              orderItem._item._name,
              orderItem._item._description,
              orderItem._item._priceM,
              orderItem._item._priceL,
              orderItem._item._imagePath,
              orderItem._item._deleted,
              orderItem._item._toppingList
            ),
            toppingArray
          )
        );
      }
      return array;
    },

    /**
     * ユーザIDを返す.
     * @param state ステート
     * @returns ユーザID
     */
    getUserId(state) {
      return state.userId;
    },
  },
  plugins: [
    createPersistedState({
      // ストレージのキーを指定
      key: "vuex",
      // ストレージの種類を指定
      storage: window.sessionStorage,
      // isLoginフラグのみセッションストレージに格納しブラウザ更新しても残るようにしている(ログイン時:true / ログアウト時:false)
      paths: ["isLogin", "cartList"],
    }),
  ],
});
