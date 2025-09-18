import User from "./User";

export enum BID_TYPE {
  PRODUCT = 'PRODUCT',
  SERVICE = 'SERVICE',
}

export enum AUCTION_TYPE {
  CLASSIC = 'CLASSIC',
  EXPRESS = 'EXPRESS',
  AUTO_SUB_BID = 'AUTO_SUB_BID',
}

export enum BID_STATUS {
  OPEN = 'OPEN',
  ON_AUCTION = 'ACCEPTED',
  CLOSED = 'CLOSED',
  ARCHIVED = 'ARCHIVED',
}

export interface Attachment {
  _id: string;
  url: string;
  filename: string;
}

export interface Category {
  _id: string;
  name: string;
}

export interface Participant {
  name: string;
  avatar?: string;
  bidAmount: number;
  bidDate: Date;
}

export interface Auction {
  _id?: string;
  owner?: string;
  title: string;
  description: string;
  attributes: string[];
  type: BID_TYPE;
  productCategory: string | Category;
  thumbs: Attachment[];
  startingAt: Date;
  endingAt: Date;
  bidType: BID_TYPE;
  auctionType: AUCTION_TYPE;
  startingPrice: number;
  currentPrice: number;
  reservePrice?: number;
  instantBuyPrice?: number;
  maxAutoBid?: number;
  winner?: User;
  winnerSelectedAt?: Date;
  status: BID_STATUS;
  participants?: Participant[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface AuctionFormData {
  title: string;
  description: string;
  attributes: string[];
  type: BID_TYPE;
  productCategory: string;
  thumbs: Attachment[];
  startingAt: Date;
  endingAt: Date;
  bidType: BID_TYPE;
  auctionType: AUCTION_TYPE;
  startingPrice: number;
  currentPrice: number;
  reservePrice?: number;
  instantBuyPrice?: number;
  maxAutoBid?: number;
  status: BID_STATUS;
}
