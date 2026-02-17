import { PopulatedUser } from "./PopulatedUser";
import { ICategory as Category } from "./Category";
import SubCategory from "./SubCategory";
import Attachment from "./Attachment";

export enum TENDER_TYPE {
  PRODUCT = 'PRODUCT',
  SERVICE = 'SERVICE',
}

export enum TENDER_STATUS {
  OPEN = 'OPEN',
  AWARDED = 'AWARDED',
  CLOSED = 'CLOSED',
  ARCHIVED = 'ARCHIVED',
}

export enum TENDER_AUCTION_TYPE {
  CLASSIC = 'CLASSIC',
  EXPRESS = 'EXPRESS',
}

export interface Tender {
  _id: string;
  owner: string | PopulatedUser;
  title: string;
  description: string;
  requirements: string[];
  category: string | Category;
  subCategory?: string | SubCategory;
  attachments: Attachment[];
  startingAt: Date;
  endingAt: Date;
  tenderType: TENDER_TYPE;
  auctionType: TENDER_AUCTION_TYPE;
  quantity?: string;
  wilaya: string;
  location: string;
  isPro: boolean;
  awardedTo?: string;
  status: TENDER_STATUS;
  comments: string[];
  createdAt: Date;
  updatedAt: Date;
}

export enum TenderBidStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  DECLINED = 'declined',
}

export interface TenderBid {
  _id: string;
  bidder: string | PopulatedUser;
  tenderOwner: string | PopulatedUser;
  tender: string | Tender;
  bidAmount: number;
  proposal?: string;
  deliveryTime?: number;
  status: TenderBidStatus;
  createdAt: Date;
  updatedAt: Date;
}
