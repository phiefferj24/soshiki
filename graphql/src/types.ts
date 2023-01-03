import { GraphQLResolveInfo } from 'graphql';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type RequireFields<T, K extends keyof T> = Omit<T, K> & { [P in K]-?: NonNullable<T[P]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
};

export type AnilistAiringSchedule = {
  __typename?: 'AnilistAiringSchedule';
  airingAt: Scalars['Int'];
  episode: Scalars['Int'];
  timeUntilAiring: Scalars['Int'];
};

export type AnilistCharacter = {
  __typename?: 'AnilistCharacter';
  id: Scalars['Int'];
  image?: Maybe<AnilistCharacterImage>;
  name?: Maybe<AnilistCharacterName>;
};

export type AnilistCharacterImage = {
  __typename?: 'AnilistCharacterImage';
  large?: Maybe<Scalars['String']>;
  medium?: Maybe<Scalars['String']>;
};

export type AnilistCharacterName = {
  __typename?: 'AnilistCharacterName';
  alternative?: Maybe<Array<Maybe<Scalars['String']>>>;
  alternativeSpoiler?: Maybe<Array<Maybe<Scalars['String']>>>;
  first?: Maybe<Scalars['String']>;
  full?: Maybe<Scalars['String']>;
  last?: Maybe<Scalars['String']>;
  middle?: Maybe<Scalars['String']>;
  native?: Maybe<Scalars['String']>;
  userPreferred?: Maybe<Scalars['String']>;
};

export type AnilistEntry = {
  __typename?: 'AnilistEntry';
  airingSchedule?: Maybe<Array<Maybe<AnilistAiringSchedule>>>;
  averageScore?: Maybe<Scalars['Int']>;
  bannerImage?: Maybe<Scalars['String']>;
  chapters?: Maybe<Scalars['Int']>;
  characters?: Maybe<Array<Maybe<AnilistCharacter>>>;
  countryOfOrigin?: Maybe<Scalars['String']>;
  coverImage?: Maybe<AnilistMediaCoverImage>;
  description?: Maybe<Scalars['String']>;
  duration?: Maybe<Scalars['Int']>;
  endDate?: Maybe<AnilistFuzzyDate>;
  episodes?: Maybe<Scalars['Int']>;
  externalLinks?: Maybe<Array<Maybe<AnilistMediaExternalLink>>>;
  favourites?: Maybe<Scalars['Int']>;
  format?: Maybe<AnilistMediaFormat>;
  genres?: Maybe<Array<Maybe<Scalars['String']>>>;
  hashtag?: Maybe<Scalars['String']>;
  id: Scalars['Int'];
  idMal?: Maybe<Scalars['Int']>;
  isAdult?: Maybe<Scalars['Boolean']>;
  isFavourite: Scalars['Boolean'];
  isLicensed?: Maybe<Scalars['Boolean']>;
  isLocked?: Maybe<Scalars['Boolean']>;
  meanScore?: Maybe<Scalars['Int']>;
  nextAiringEpisode?: Maybe<AnilistAiringSchedule>;
  popularity?: Maybe<Scalars['Int']>;
  rankings?: Maybe<Array<Maybe<AnilistMediaRank>>>;
  recommendations?: Maybe<Array<Maybe<AnilistRecommendation>>>;
  relations?: Maybe<Array<Maybe<AnilistEntry>>>;
  season?: Maybe<AnilistMediaSeason>;
  seasonInt?: Maybe<Scalars['Int']>;
  seasonYear?: Maybe<Scalars['Int']>;
  siteUrl?: Maybe<Scalars['String']>;
  source?: Maybe<AnilistMediaSource>;
  staff?: Maybe<Array<Maybe<AnilistStaff>>>;
  startDate?: Maybe<AnilistFuzzyDate>;
  stats?: Maybe<AnilistMediaStats>;
  status?: Maybe<AnilistMediaStatus>;
  streamingEpisodes?: Maybe<Array<Maybe<AnilistMediaStreamingEpisode>>>;
  studios?: Maybe<Array<Maybe<AnilistStudio>>>;
  synonyms?: Maybe<Array<Maybe<Scalars['String']>>>;
  tags?: Maybe<Array<Maybe<AnilistMediaTag>>>;
  title?: Maybe<AnilistMediaTitle>;
  trailer?: Maybe<AnilistTrailer>;
  trending?: Maybe<Scalars['Int']>;
  type?: Maybe<AnilistMediaType>;
  updatedAt?: Maybe<Scalars['Int']>;
  volumes?: Maybe<Scalars['Int']>;
};

export type AnilistFuzzyDate = {
  __typename?: 'AnilistFuzzyDate';
  day?: Maybe<Scalars['Int']>;
  month?: Maybe<Scalars['Int']>;
  year?: Maybe<Scalars['Int']>;
};

export type AnilistMediaCoverImage = {
  __typename?: 'AnilistMediaCoverImage';
  color?: Maybe<Scalars['String']>;
  extraLarge?: Maybe<Scalars['String']>;
  large?: Maybe<Scalars['String']>;
  medium?: Maybe<Scalars['String']>;
};

export type AnilistMediaExternalLink = {
  __typename?: 'AnilistMediaExternalLink';
  url?: Maybe<Scalars['String']>;
};

export enum AnilistMediaFormat {
  Manga = 'MANGA',
  Movie = 'MOVIE',
  Music = 'MUSIC',
  Novel = 'NOVEL',
  Ona = 'ONA',
  OneShot = 'ONE_SHOT',
  Ova = 'OVA',
  Special = 'SPECIAL',
  Tv = 'TV',
  TvShort = 'TV_SHORT'
}

export enum AnilistMediaListStatus {
  Completed = 'COMPLETED',
  Current = 'CURRENT',
  Dropped = 'DROPPED',
  Paused = 'PAUSED',
  Planning = 'PLANNING',
  Repeating = 'REPEATING'
}

export type AnilistMediaRank = {
  __typename?: 'AnilistMediaRank';
  context: Scalars['String'];
  rank: Scalars['Int'];
  season?: Maybe<AnilistMediaSeason>;
  type: AnilistMediaRankType;
  year?: Maybe<Scalars['Int']>;
};

export enum AnilistMediaRankType {
  Popular = 'POPULAR',
  Rated = 'RATED'
}

export enum AnilistMediaSeason {
  Fall = 'FALL',
  Spring = 'SPRING',
  Summer = 'SUMMER',
  Winter = 'WINTER'
}

export enum AnilistMediaSource {
  Anime = 'ANIME',
  Comic = 'COMIC',
  Doujinshi = 'DOUJINSHI',
  Game = 'GAME',
  LightNovel = 'LIGHT_NOVEL',
  LiveAction = 'LIVE_ACTION',
  Manga = 'MANGA',
  MultimediaProject = 'MULTIMEDIA_PROJECT',
  Novel = 'NOVEL',
  Original = 'ORIGINAL',
  Other = 'OTHER',
  PictureBook = 'PICTURE_BOOK',
  VideoGame = 'VIDEO_GAME',
  VisualNovel = 'VISUAL_NOVEL',
  WebNovel = 'WEB_NOVEL'
}

export type AnilistMediaStats = {
  __typename?: 'AnilistMediaStats';
  scoreDistribution?: Maybe<Array<Maybe<AnilistScoreDistribution>>>;
  statusDistribution?: Maybe<Array<Maybe<AnilistStatusDistribution>>>;
};

export enum AnilistMediaStatus {
  Cancelled = 'CANCELLED',
  Finished = 'FINISHED',
  Hiatus = 'HIATUS',
  NotYetReleased = 'NOT_YET_RELEASED',
  Releasing = 'RELEASING'
}

export type AnilistMediaStreamingEpisode = {
  __typename?: 'AnilistMediaStreamingEpisode';
  site?: Maybe<Scalars['String']>;
  thumbnail?: Maybe<Scalars['String']>;
  title?: Maybe<Scalars['String']>;
  url?: Maybe<Scalars['String']>;
};

export type AnilistMediaTag = {
  __typename?: 'AnilistMediaTag';
  category?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
  id: Scalars['Int'];
  isAdult?: Maybe<Scalars['Boolean']>;
  isGeneralSpoiler?: Maybe<Scalars['Boolean']>;
  isMediaSpoiler?: Maybe<Scalars['Boolean']>;
  name: Scalars['String'];
  rank?: Maybe<Scalars['Int']>;
  userId?: Maybe<Scalars['Int']>;
};

export type AnilistMediaTitle = {
  __typename?: 'AnilistMediaTitle';
  english?: Maybe<Scalars['String']>;
  native?: Maybe<Scalars['String']>;
  romaji?: Maybe<Scalars['String']>;
  userPreferred?: Maybe<Scalars['String']>;
};

export enum AnilistMediaType {
  Anime = 'ANIME',
  Manga = 'MANGA'
}

export type AnilistRecommendation = {
  __typename?: 'AnilistRecommendation';
  mediaRecommendation?: Maybe<AnilistEntry>;
};

export type AnilistScoreDistribution = {
  __typename?: 'AnilistScoreDistribution';
  amount?: Maybe<Scalars['Int']>;
  score?: Maybe<Scalars['Int']>;
};

export type AnilistStaff = {
  __typename?: 'AnilistStaff';
  id: Scalars['Int'];
  image?: Maybe<AnilistStaffImage>;
  name?: Maybe<AnilistStaffName>;
};

export type AnilistStaffImage = {
  __typename?: 'AnilistStaffImage';
  large?: Maybe<Scalars['String']>;
  medium?: Maybe<Scalars['String']>;
};

export type AnilistStaffName = {
  __typename?: 'AnilistStaffName';
  alternative?: Maybe<Array<Maybe<Scalars['String']>>>;
  alternativeSpoiler?: Maybe<Array<Maybe<Scalars['String']>>>;
  first?: Maybe<Scalars['String']>;
  full?: Maybe<Scalars['String']>;
  last?: Maybe<Scalars['String']>;
  middle?: Maybe<Scalars['String']>;
  native?: Maybe<Scalars['String']>;
  userPreferred?: Maybe<Scalars['String']>;
};

export type AnilistStatusDistribution = {
  __typename?: 'AnilistStatusDistribution';
  amount?: Maybe<Scalars['Int']>;
  status?: Maybe<AnilistMediaListStatus>;
};

export type AnilistStudio = {
  __typename?: 'AnilistStudio';
  id: Scalars['Int'];
  isAnimationStudio: Scalars['Boolean'];
  name: Scalars['String'];
};

export type AnilistTrailer = {
  __typename?: 'AnilistTrailer';
  id?: Maybe<Scalars['String']>;
  site?: Maybe<Scalars['String']>;
  thumbnail?: Maybe<Scalars['String']>;
};

export type AnilistUser = {
  __typename?: 'AnilistUser';
  avatar?: Maybe<AnilistUserAvatar>;
  id: Scalars['Int'];
  name: Scalars['String'];
};

export type AnilistUserAvatar = {
  __typename?: 'AnilistUserAvatar';
  large?: Maybe<Scalars['String']>;
  medium?: Maybe<Scalars['String']>;
};

export type Category = {
  __typename?: 'Category';
  entries: Array<Maybe<EntryConnection>>;
  name: Scalars['String'];
};

export type EmbeddedHistoryEntry = {
  __typename?: 'EmbeddedHistoryEntry';
  chapter?: Maybe<Scalars['Float']>;
  episode?: Maybe<Scalars['Float']>;
  id: Scalars['ID'];
  lastTime?: Maybe<Scalars['Float']>;
  page?: Maybe<Scalars['Int']>;
  rating?: Maybe<Scalars['Float']>;
  startTime?: Maybe<Scalars['Float']>;
  status?: Maybe<TrackerStatus>;
  timestamp?: Maybe<Scalars['Int']>;
  trackerIds?: Maybe<Array<Maybe<Tracker>>>;
};

export type Entry = {
  __typename?: 'Entry';
  history?: Maybe<EmbeddedHistoryEntry>;
  id: Scalars['ID'];
  info: EntryInfo;
  platforms: Array<Maybe<Platform>>;
  trackers: Array<Maybe<Tracker>>;
};

export type EntryConnection = {
  __typename?: 'EntryConnection';
  entry?: Maybe<Entry>;
  id: Scalars['ID'];
};

export type EntryInfo = {
  __typename?: 'EntryInfo';
  altTitles: Array<Maybe<Scalars['String']>>;
  anilist?: Maybe<AnilistEntry>;
  author: Scalars['String'];
  cover: Scalars['String'];
  mal?: Maybe<MalEntry>;
  nsfw: Scalars['Boolean'];
  title: Scalars['String'];
};

export type History = {
  __typename?: 'History';
  entries: Array<Maybe<HistoryEntry>>;
  mediaType: MediaType;
};

export type HistoryEntry = {
  __typename?: 'HistoryEntry';
  chapter?: Maybe<Scalars['Float']>;
  entry?: Maybe<Entry>;
  episode?: Maybe<Scalars['Float']>;
  id: Scalars['ID'];
  lastTime?: Maybe<Scalars['Float']>;
  page?: Maybe<Scalars['Int']>;
  rating?: Maybe<Scalars['Float']>;
  startTime?: Maybe<Scalars['Float']>;
  status?: Maybe<TrackerStatus>;
  timestamp?: Maybe<Scalars['Int']>;
  trackerIds?: Maybe<Array<Maybe<UserTracker>>>;
};

export type Library = {
  __typename?: 'Library';
  categories: Array<Maybe<Category>>;
  mediaType: MediaType;
};

export type MalAlternativeTitles = {
  __typename?: 'MALAlternativeTitles';
  en?: Maybe<Scalars['String']>;
  ja?: Maybe<Scalars['String']>;
  synonyms?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type MalEntry = {
  __typename?: 'MALEntry';
  alternativeTitles?: Maybe<MalAlternativeTitles>;
  authors?: Maybe<Array<Maybe<MalPerson>>>;
  background?: Maybe<Scalars['String']>;
  createdAt: Scalars['String'];
  endDate?: Maybe<Scalars['String']>;
  genres: Array<Maybe<MalGenre>>;
  id: Scalars['Int'];
  mainPicture?: Maybe<MalPicture>;
  mean?: Maybe<Scalars['Float']>;
  mediaType: Scalars['String'];
  nsfw?: Maybe<Scalars['String']>;
  numChapters?: Maybe<Scalars['Int']>;
  numListUsers: Scalars['Int'];
  numScoringUsers: Scalars['Int'];
  numVolumes?: Maybe<Scalars['Int']>;
  pictures: Array<Maybe<MalPicture>>;
  rank?: Maybe<Scalars['Int']>;
  recommendations: Array<Maybe<MalRecommendation>>;
  relatedAnime: Array<Maybe<MalRelation>>;
  relatedManga: Array<Maybe<MalRelation>>;
  startDate?: Maybe<Scalars['String']>;
  status: Scalars['String'];
  synopsis?: Maybe<Scalars['String']>;
  title: Scalars['String'];
  updatedAt: Scalars['String'];
};

export type MalGenre = {
  __typename?: 'MALGenre';
  id: Scalars['Int'];
  name: Scalars['String'];
};

export type MalPerson = {
  __typename?: 'MALPerson';
  info: MalPersonInfo;
  role: Scalars['String'];
};

export type MalPersonInfo = {
  __typename?: 'MALPersonInfo';
  firstName: Scalars['String'];
  id: Scalars['Int'];
  lastName: Scalars['String'];
};

export type MalPicture = {
  __typename?: 'MALPicture';
  large?: Maybe<Scalars['String']>;
  medium: Scalars['String'];
};

export type MalRecommendation = {
  __typename?: 'MALRecommendation';
  node: MalShortEntry;
  numRecommendations: Scalars['Int'];
};

export type MalRelation = {
  __typename?: 'MALRelation';
  node: MalShortEntry;
  relationType: Scalars['String'];
  relationTypeFormatted: Scalars['String'];
};

export type MalShortEntry = {
  __typename?: 'MALShortEntry';
  id: Scalars['ID'];
  mainPicture?: Maybe<MalPicture>;
  title: Scalars['String'];
};

export type MalUser = {
  __typename?: 'MALUser';
  id: Scalars['Int'];
  name: Scalars['String'];
  picture: Scalars['String'];
};

export enum MediaType {
  Image = 'IMAGE',
  Text = 'TEXT',
  Video = 'VIDEO'
}

export type Mutation = {
  __typename?: 'Mutation';
  AddLibraryCategories?: Maybe<Library>;
  AddLibraryCategory?: Maybe<Library>;
  AddLibraryItem?: Maybe<Library>;
  AddLibraryItemToCategory?: Maybe<Library>;
  AddLibraryItems?: Maybe<Library>;
  AddLibraryItemsToCategory?: Maybe<Library>;
  RemoveHistoryEntry?: Maybe<History>;
  RemoveLibraryCategories?: Maybe<Library>;
  RemoveLibraryCategory?: Maybe<Library>;
  RemoveLibraryItem?: Maybe<Library>;
  RemoveLibraryItemFromCategory?: Maybe<Library>;
  RemoveLibraryItems?: Maybe<Library>;
  RemoveLibraryItemsFromCategory?: Maybe<Library>;
  RemoveLink?: Maybe<EntryConnection>;
  SetHistoryEntry?: Maybe<HistoryEntry>;
  SetLink?: Maybe<EntryConnection>;
};


export type MutationAddLibraryCategoriesArgs = {
  mediaType: MediaType;
  names: Array<Scalars['String']>;
};


export type MutationAddLibraryCategoryArgs = {
  mediaType: MediaType;
  name: Scalars['String'];
};


export type MutationAddLibraryItemArgs = {
  category?: InputMaybe<Scalars['String']>;
  id: Scalars['ID'];
  mediaType: MediaType;
};


export type MutationAddLibraryItemToCategoryArgs = {
  category: Scalars['String'];
  id: Scalars['ID'];
  mediaType: MediaType;
};


export type MutationAddLibraryItemsArgs = {
  category?: InputMaybe<Scalars['String']>;
  ids: Array<Scalars['ID']>;
  mediaType: MediaType;
};


export type MutationAddLibraryItemsToCategoryArgs = {
  category: Scalars['String'];
  ids: Array<Scalars['ID']>;
  mediaType: MediaType;
};


export type MutationRemoveHistoryEntryArgs = {
  id: Scalars['ID'];
  mediaType: MediaType;
};


export type MutationRemoveLibraryCategoriesArgs = {
  mediaType: MediaType;
  names: Array<Scalars['String']>;
};


export type MutationRemoveLibraryCategoryArgs = {
  mediaType: MediaType;
  name: Scalars['String'];
};


export type MutationRemoveLibraryItemArgs = {
  id: Scalars['ID'];
  mediaType: MediaType;
};


export type MutationRemoveLibraryItemFromCategoryArgs = {
  category: Scalars['String'];
  id: Scalars['ID'];
  mediaType: MediaType;
};


export type MutationRemoveLibraryItemsArgs = {
  ids: Array<Scalars['ID']>;
  mediaType: MediaType;
};


export type MutationRemoveLibraryItemsFromCategoryArgs = {
  category: Scalars['String'];
  ids: Array<Scalars['ID']>;
  mediaType: MediaType;
};


export type MutationRemoveLinkArgs = {
  id: Scalars['ID'];
  mediaType: MediaType;
  platform: Scalars['String'];
  source: Scalars['String'];
};


export type MutationSetHistoryEntryArgs = {
  chapter?: InputMaybe<Scalars['Float']>;
  episode?: InputMaybe<Scalars['Float']>;
  id: Scalars['ID'];
  lastTime?: InputMaybe<Scalars['Float']>;
  mediaType: MediaType;
  page?: InputMaybe<Scalars['Int']>;
  rating?: InputMaybe<Scalars['Float']>;
  startTime?: InputMaybe<Scalars['Float']>;
  status?: InputMaybe<TrackerStatus>;
  timestamp?: InputMaybe<Scalars['Int']>;
  trackers?: InputMaybe<Array<UserTrackerInput>>;
  volume?: InputMaybe<Scalars['Float']>;
};


export type MutationSetLinkArgs = {
  id: Scalars['ID'];
  mediaType: MediaType;
  platform: Scalars['String'];
  source: Scalars['String'];
  sourceId: Scalars['ID'];
};

export type Platform = {
  __typename?: 'Platform';
  name: Scalars['String'];
  sources: Array<Maybe<Source>>;
};

export type Query = {
  __typename?: 'Query';
  Entries: Array<Maybe<Entry>>;
  Entry?: Maybe<Entry>;
  Histories: Array<Maybe<History>>;
  History?: Maybe<History>;
  HistoryEntries: Array<Maybe<HistoryEntry>>;
  HistoryEntry?: Maybe<HistoryEntry>;
  Libraries: Array<Maybe<Library>>;
  Library?: Maybe<Library>;
  Link?: Maybe<EntryConnection>;
  Search: Array<Maybe<Entry>>;
  User?: Maybe<User>;
  Users: Array<Maybe<User>>;
};


export type QueryEntriesArgs = {
  ids: Array<Scalars['ID']>;
  mediaType: MediaType;
};


export type QueryEntryArgs = {
  id: Scalars['ID'];
  mediaType: MediaType;
};


export type QueryHistoryArgs = {
  mediaType: MediaType;
};


export type QueryHistoryEntriesArgs = {
  ids: Array<Scalars['ID']>;
  mediaType: MediaType;
};


export type QueryHistoryEntryArgs = {
  id: Scalars['ID'];
  mediaType: MediaType;
};


export type QueryLibraryArgs = {
  mediaType: MediaType;
};


export type QueryLinkArgs = {
  mediaType: MediaType;
  platform: Scalars['String'];
  source: Scalars['String'];
  sourceId: Scalars['ID'];
};


export type QuerySearchArgs = {
  mediaType: MediaType;
  query: Scalars['String'];
};


export type QueryUserArgs = {
  id?: InputMaybe<Scalars['ID']>;
};


export type QueryUsersArgs = {
  ids: Array<Scalars['ID']>;
};

export type Source = {
  __typename?: 'Source';
  id: Scalars['String'];
  name: Scalars['String'];
  user?: Maybe<Scalars['String']>;
};

export type Tracker = {
  __typename?: 'Tracker';
  id?: Maybe<Scalars['String']>;
  name: Scalars['String'];
  user?: Maybe<Scalars['String']>;
};

export enum TrackerStatus {
  Completed = 'COMPLETED',
  Dropped = 'DROPPED',
  Ongoing = 'ONGOING',
  Paused = 'PAUSED',
  Planned = 'PLANNED',
  Unknown = 'UNKNOWN'
}

export type User = {
  __typename?: 'User';
  data: UserData;
  discord?: Maybe<Scalars['String']>;
  id: Scalars['ID'];
};

export type UserData = {
  __typename?: 'UserData';
  anilist?: Maybe<AnilistUser>;
  history?: Maybe<Array<Maybe<History>>>;
  library?: Maybe<Array<Maybe<Library>>>;
  mal?: Maybe<MalUser>;
};

export type UserTracker = {
  __typename?: 'UserTracker';
  id: Scalars['String'];
  name: Scalars['String'];
};

export type UserTrackerInput = {
  id: Scalars['String'];
  name: Scalars['String'];
};

export type WithIndex<TObject> = TObject & Record<string, any>;
export type ResolversObject<TObject> = WithIndex<TObject>;

export type ResolverTypeWrapper<T> = Promise<T> | T;


export type ResolverWithResolve<TResult, TParent, TContext, TArgs> = {
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> = ResolverFn<TResult, TParent, TContext, TArgs> | ResolverWithResolve<TResult, TParent, TContext, TArgs>;

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => AsyncIterable<TResult> | Promise<AsyncIterable<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<TResult, TKey extends string, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<{ [key in TKey]: TResult }, TParent, TContext, TArgs>;
  resolve?: SubscriptionResolveFn<TResult, { [key in TKey]: TResult }, TContext, TArgs>;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<TResult, TKey extends string, TParent, TContext, TArgs> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<TResult, TKey extends string, TParent = {}, TContext = {}, TArgs = {}> =
  | ((...args: any[]) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = {}, TContext = {}> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type IsTypeOfResolverFn<T = {}, TContext = {}> = (obj: T, context: TContext, info: GraphQLResolveInfo) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<TResult = {}, TParent = {}, TContext = {}, TArgs = {}> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = ResolversObject<{
  AnilistAiringSchedule: ResolverTypeWrapper<AnilistAiringSchedule>;
  AnilistCharacter: ResolverTypeWrapper<AnilistCharacter>;
  AnilistCharacterImage: ResolverTypeWrapper<AnilistCharacterImage>;
  AnilistCharacterName: ResolverTypeWrapper<AnilistCharacterName>;
  AnilistEntry: ResolverTypeWrapper<AnilistEntry>;
  AnilistFuzzyDate: ResolverTypeWrapper<AnilistFuzzyDate>;
  AnilistMediaCoverImage: ResolverTypeWrapper<AnilistMediaCoverImage>;
  AnilistMediaExternalLink: ResolverTypeWrapper<AnilistMediaExternalLink>;
  AnilistMediaFormat: AnilistMediaFormat;
  AnilistMediaListStatus: AnilistMediaListStatus;
  AnilistMediaRank: ResolverTypeWrapper<AnilistMediaRank>;
  AnilistMediaRankType: AnilistMediaRankType;
  AnilistMediaSeason: AnilistMediaSeason;
  AnilistMediaSource: AnilistMediaSource;
  AnilistMediaStats: ResolverTypeWrapper<AnilistMediaStats>;
  AnilistMediaStatus: AnilistMediaStatus;
  AnilistMediaStreamingEpisode: ResolverTypeWrapper<AnilistMediaStreamingEpisode>;
  AnilistMediaTag: ResolverTypeWrapper<AnilistMediaTag>;
  AnilistMediaTitle: ResolverTypeWrapper<AnilistMediaTitle>;
  AnilistMediaType: AnilistMediaType;
  AnilistRecommendation: ResolverTypeWrapper<AnilistRecommendation>;
  AnilistScoreDistribution: ResolverTypeWrapper<AnilistScoreDistribution>;
  AnilistStaff: ResolverTypeWrapper<AnilistStaff>;
  AnilistStaffImage: ResolverTypeWrapper<AnilistStaffImage>;
  AnilistStaffName: ResolverTypeWrapper<AnilistStaffName>;
  AnilistStatusDistribution: ResolverTypeWrapper<AnilistStatusDistribution>;
  AnilistStudio: ResolverTypeWrapper<AnilistStudio>;
  AnilistTrailer: ResolverTypeWrapper<AnilistTrailer>;
  AnilistUser: ResolverTypeWrapper<AnilistUser>;
  AnilistUserAvatar: ResolverTypeWrapper<AnilistUserAvatar>;
  Boolean: ResolverTypeWrapper<Scalars['Boolean']>;
  Category: ResolverTypeWrapper<Category>;
  EmbeddedHistoryEntry: ResolverTypeWrapper<EmbeddedHistoryEntry>;
  Entry: ResolverTypeWrapper<Entry>;
  EntryConnection: ResolverTypeWrapper<EntryConnection>;
  EntryInfo: ResolverTypeWrapper<EntryInfo>;
  Float: ResolverTypeWrapper<Scalars['Float']>;
  History: ResolverTypeWrapper<History>;
  HistoryEntry: ResolverTypeWrapper<HistoryEntry>;
  ID: ResolverTypeWrapper<Scalars['ID']>;
  Int: ResolverTypeWrapper<Scalars['Int']>;
  Library: ResolverTypeWrapper<Library>;
  MALAlternativeTitles: ResolverTypeWrapper<MalAlternativeTitles>;
  MALEntry: ResolverTypeWrapper<MalEntry>;
  MALGenre: ResolverTypeWrapper<MalGenre>;
  MALPerson: ResolverTypeWrapper<MalPerson>;
  MALPersonInfo: ResolverTypeWrapper<MalPersonInfo>;
  MALPicture: ResolverTypeWrapper<MalPicture>;
  MALRecommendation: ResolverTypeWrapper<MalRecommendation>;
  MALRelation: ResolverTypeWrapper<MalRelation>;
  MALShortEntry: ResolverTypeWrapper<MalShortEntry>;
  MALUser: ResolverTypeWrapper<MalUser>;
  MediaType: MediaType;
  Mutation: ResolverTypeWrapper<{}>;
  Platform: ResolverTypeWrapper<Platform>;
  Query: ResolverTypeWrapper<{}>;
  Source: ResolverTypeWrapper<Source>;
  String: ResolverTypeWrapper<Scalars['String']>;
  Tracker: ResolverTypeWrapper<Tracker>;
  TrackerStatus: TrackerStatus;
  User: ResolverTypeWrapper<User>;
  UserData: ResolverTypeWrapper<UserData>;
  UserTracker: ResolverTypeWrapper<UserTracker>;
  UserTrackerInput: UserTrackerInput;
}>;

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = ResolversObject<{
  AnilistAiringSchedule: AnilistAiringSchedule;
  AnilistCharacter: AnilistCharacter;
  AnilistCharacterImage: AnilistCharacterImage;
  AnilistCharacterName: AnilistCharacterName;
  AnilistEntry: AnilistEntry;
  AnilistFuzzyDate: AnilistFuzzyDate;
  AnilistMediaCoverImage: AnilistMediaCoverImage;
  AnilistMediaExternalLink: AnilistMediaExternalLink;
  AnilistMediaRank: AnilistMediaRank;
  AnilistMediaStats: AnilistMediaStats;
  AnilistMediaStreamingEpisode: AnilistMediaStreamingEpisode;
  AnilistMediaTag: AnilistMediaTag;
  AnilistMediaTitle: AnilistMediaTitle;
  AnilistRecommendation: AnilistRecommendation;
  AnilistScoreDistribution: AnilistScoreDistribution;
  AnilistStaff: AnilistStaff;
  AnilistStaffImage: AnilistStaffImage;
  AnilistStaffName: AnilistStaffName;
  AnilistStatusDistribution: AnilistStatusDistribution;
  AnilistStudio: AnilistStudio;
  AnilistTrailer: AnilistTrailer;
  AnilistUser: AnilistUser;
  AnilistUserAvatar: AnilistUserAvatar;
  Boolean: Scalars['Boolean'];
  Category: Category;
  EmbeddedHistoryEntry: EmbeddedHistoryEntry;
  Entry: Entry;
  EntryConnection: EntryConnection;
  EntryInfo: EntryInfo;
  Float: Scalars['Float'];
  History: History;
  HistoryEntry: HistoryEntry;
  ID: Scalars['ID'];
  Int: Scalars['Int'];
  Library: Library;
  MALAlternativeTitles: MalAlternativeTitles;
  MALEntry: MalEntry;
  MALGenre: MalGenre;
  MALPerson: MalPerson;
  MALPersonInfo: MalPersonInfo;
  MALPicture: MalPicture;
  MALRecommendation: MalRecommendation;
  MALRelation: MalRelation;
  MALShortEntry: MalShortEntry;
  MALUser: MalUser;
  Mutation: {};
  Platform: Platform;
  Query: {};
  Source: Source;
  String: Scalars['String'];
  Tracker: Tracker;
  User: User;
  UserData: UserData;
  UserTracker: UserTracker;
  UserTrackerInput: UserTrackerInput;
}>;

export type AnilistAiringScheduleResolvers<ContextType = any, ParentType extends ResolversParentTypes['AnilistAiringSchedule'] = ResolversParentTypes['AnilistAiringSchedule']> = ResolversObject<{
  airingAt?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  episode?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  timeUntilAiring?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type AnilistCharacterResolvers<ContextType = any, ParentType extends ResolversParentTypes['AnilistCharacter'] = ResolversParentTypes['AnilistCharacter']> = ResolversObject<{
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  image?: Resolver<Maybe<ResolversTypes['AnilistCharacterImage']>, ParentType, ContextType>;
  name?: Resolver<Maybe<ResolversTypes['AnilistCharacterName']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type AnilistCharacterImageResolvers<ContextType = any, ParentType extends ResolversParentTypes['AnilistCharacterImage'] = ResolversParentTypes['AnilistCharacterImage']> = ResolversObject<{
  large?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  medium?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type AnilistCharacterNameResolvers<ContextType = any, ParentType extends ResolversParentTypes['AnilistCharacterName'] = ResolversParentTypes['AnilistCharacterName']> = ResolversObject<{
  alternative?: Resolver<Maybe<Array<Maybe<ResolversTypes['String']>>>, ParentType, ContextType>;
  alternativeSpoiler?: Resolver<Maybe<Array<Maybe<ResolversTypes['String']>>>, ParentType, ContextType>;
  first?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  full?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  last?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  middle?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  native?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  userPreferred?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type AnilistEntryResolvers<ContextType = any, ParentType extends ResolversParentTypes['AnilistEntry'] = ResolversParentTypes['AnilistEntry']> = ResolversObject<{
  airingSchedule?: Resolver<Maybe<Array<Maybe<ResolversTypes['AnilistAiringSchedule']>>>, ParentType, ContextType>;
  averageScore?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  bannerImage?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  chapters?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  characters?: Resolver<Maybe<Array<Maybe<ResolversTypes['AnilistCharacter']>>>, ParentType, ContextType>;
  countryOfOrigin?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  coverImage?: Resolver<Maybe<ResolversTypes['AnilistMediaCoverImage']>, ParentType, ContextType>;
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  duration?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  endDate?: Resolver<Maybe<ResolversTypes['AnilistFuzzyDate']>, ParentType, ContextType>;
  episodes?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  externalLinks?: Resolver<Maybe<Array<Maybe<ResolversTypes['AnilistMediaExternalLink']>>>, ParentType, ContextType>;
  favourites?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  format?: Resolver<Maybe<ResolversTypes['AnilistMediaFormat']>, ParentType, ContextType>;
  genres?: Resolver<Maybe<Array<Maybe<ResolversTypes['String']>>>, ParentType, ContextType>;
  hashtag?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  idMal?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  isAdult?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  isFavourite?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  isLicensed?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  isLocked?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  meanScore?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  nextAiringEpisode?: Resolver<Maybe<ResolversTypes['AnilistAiringSchedule']>, ParentType, ContextType>;
  popularity?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  rankings?: Resolver<Maybe<Array<Maybe<ResolversTypes['AnilistMediaRank']>>>, ParentType, ContextType>;
  recommendations?: Resolver<Maybe<Array<Maybe<ResolversTypes['AnilistRecommendation']>>>, ParentType, ContextType>;
  relations?: Resolver<Maybe<Array<Maybe<ResolversTypes['AnilistEntry']>>>, ParentType, ContextType>;
  season?: Resolver<Maybe<ResolversTypes['AnilistMediaSeason']>, ParentType, ContextType>;
  seasonInt?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  seasonYear?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  siteUrl?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  source?: Resolver<Maybe<ResolversTypes['AnilistMediaSource']>, ParentType, ContextType>;
  staff?: Resolver<Maybe<Array<Maybe<ResolversTypes['AnilistStaff']>>>, ParentType, ContextType>;
  startDate?: Resolver<Maybe<ResolversTypes['AnilistFuzzyDate']>, ParentType, ContextType>;
  stats?: Resolver<Maybe<ResolversTypes['AnilistMediaStats']>, ParentType, ContextType>;
  status?: Resolver<Maybe<ResolversTypes['AnilistMediaStatus']>, ParentType, ContextType>;
  streamingEpisodes?: Resolver<Maybe<Array<Maybe<ResolversTypes['AnilistMediaStreamingEpisode']>>>, ParentType, ContextType>;
  studios?: Resolver<Maybe<Array<Maybe<ResolversTypes['AnilistStudio']>>>, ParentType, ContextType>;
  synonyms?: Resolver<Maybe<Array<Maybe<ResolversTypes['String']>>>, ParentType, ContextType>;
  tags?: Resolver<Maybe<Array<Maybe<ResolversTypes['AnilistMediaTag']>>>, ParentType, ContextType>;
  title?: Resolver<Maybe<ResolversTypes['AnilistMediaTitle']>, ParentType, ContextType>;
  trailer?: Resolver<Maybe<ResolversTypes['AnilistTrailer']>, ParentType, ContextType>;
  trending?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  type?: Resolver<Maybe<ResolversTypes['AnilistMediaType']>, ParentType, ContextType>;
  updatedAt?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  volumes?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type AnilistFuzzyDateResolvers<ContextType = any, ParentType extends ResolversParentTypes['AnilistFuzzyDate'] = ResolversParentTypes['AnilistFuzzyDate']> = ResolversObject<{
  day?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  month?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  year?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type AnilistMediaCoverImageResolvers<ContextType = any, ParentType extends ResolversParentTypes['AnilistMediaCoverImage'] = ResolversParentTypes['AnilistMediaCoverImage']> = ResolversObject<{
  color?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  extraLarge?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  large?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  medium?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type AnilistMediaExternalLinkResolvers<ContextType = any, ParentType extends ResolversParentTypes['AnilistMediaExternalLink'] = ResolversParentTypes['AnilistMediaExternalLink']> = ResolversObject<{
  url?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type AnilistMediaRankResolvers<ContextType = any, ParentType extends ResolversParentTypes['AnilistMediaRank'] = ResolversParentTypes['AnilistMediaRank']> = ResolversObject<{
  context?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  rank?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  season?: Resolver<Maybe<ResolversTypes['AnilistMediaSeason']>, ParentType, ContextType>;
  type?: Resolver<ResolversTypes['AnilistMediaRankType'], ParentType, ContextType>;
  year?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type AnilistMediaStatsResolvers<ContextType = any, ParentType extends ResolversParentTypes['AnilistMediaStats'] = ResolversParentTypes['AnilistMediaStats']> = ResolversObject<{
  scoreDistribution?: Resolver<Maybe<Array<Maybe<ResolversTypes['AnilistScoreDistribution']>>>, ParentType, ContextType>;
  statusDistribution?: Resolver<Maybe<Array<Maybe<ResolversTypes['AnilistStatusDistribution']>>>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type AnilistMediaStreamingEpisodeResolvers<ContextType = any, ParentType extends ResolversParentTypes['AnilistMediaStreamingEpisode'] = ResolversParentTypes['AnilistMediaStreamingEpisode']> = ResolversObject<{
  site?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  thumbnail?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  title?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  url?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type AnilistMediaTagResolvers<ContextType = any, ParentType extends ResolversParentTypes['AnilistMediaTag'] = ResolversParentTypes['AnilistMediaTag']> = ResolversObject<{
  category?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  isAdult?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  isGeneralSpoiler?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  isMediaSpoiler?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  rank?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  userId?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type AnilistMediaTitleResolvers<ContextType = any, ParentType extends ResolversParentTypes['AnilistMediaTitle'] = ResolversParentTypes['AnilistMediaTitle']> = ResolversObject<{
  english?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  native?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  romaji?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  userPreferred?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type AnilistRecommendationResolvers<ContextType = any, ParentType extends ResolversParentTypes['AnilistRecommendation'] = ResolversParentTypes['AnilistRecommendation']> = ResolversObject<{
  mediaRecommendation?: Resolver<Maybe<ResolversTypes['AnilistEntry']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type AnilistScoreDistributionResolvers<ContextType = any, ParentType extends ResolversParentTypes['AnilistScoreDistribution'] = ResolversParentTypes['AnilistScoreDistribution']> = ResolversObject<{
  amount?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  score?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type AnilistStaffResolvers<ContextType = any, ParentType extends ResolversParentTypes['AnilistStaff'] = ResolversParentTypes['AnilistStaff']> = ResolversObject<{
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  image?: Resolver<Maybe<ResolversTypes['AnilistStaffImage']>, ParentType, ContextType>;
  name?: Resolver<Maybe<ResolversTypes['AnilistStaffName']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type AnilistStaffImageResolvers<ContextType = any, ParentType extends ResolversParentTypes['AnilistStaffImage'] = ResolversParentTypes['AnilistStaffImage']> = ResolversObject<{
  large?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  medium?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type AnilistStaffNameResolvers<ContextType = any, ParentType extends ResolversParentTypes['AnilistStaffName'] = ResolversParentTypes['AnilistStaffName']> = ResolversObject<{
  alternative?: Resolver<Maybe<Array<Maybe<ResolversTypes['String']>>>, ParentType, ContextType>;
  alternativeSpoiler?: Resolver<Maybe<Array<Maybe<ResolversTypes['String']>>>, ParentType, ContextType>;
  first?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  full?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  last?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  middle?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  native?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  userPreferred?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type AnilistStatusDistributionResolvers<ContextType = any, ParentType extends ResolversParentTypes['AnilistStatusDistribution'] = ResolversParentTypes['AnilistStatusDistribution']> = ResolversObject<{
  amount?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  status?: Resolver<Maybe<ResolversTypes['AnilistMediaListStatus']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type AnilistStudioResolvers<ContextType = any, ParentType extends ResolversParentTypes['AnilistStudio'] = ResolversParentTypes['AnilistStudio']> = ResolversObject<{
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  isAnimationStudio?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type AnilistTrailerResolvers<ContextType = any, ParentType extends ResolversParentTypes['AnilistTrailer'] = ResolversParentTypes['AnilistTrailer']> = ResolversObject<{
  id?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  site?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  thumbnail?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type AnilistUserResolvers<ContextType = any, ParentType extends ResolversParentTypes['AnilistUser'] = ResolversParentTypes['AnilistUser']> = ResolversObject<{
  avatar?: Resolver<Maybe<ResolversTypes['AnilistUserAvatar']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type AnilistUserAvatarResolvers<ContextType = any, ParentType extends ResolversParentTypes['AnilistUserAvatar'] = ResolversParentTypes['AnilistUserAvatar']> = ResolversObject<{
  large?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  medium?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type CategoryResolvers<ContextType = any, ParentType extends ResolversParentTypes['Category'] = ResolversParentTypes['Category']> = ResolversObject<{
  entries?: Resolver<Array<Maybe<ResolversTypes['EntryConnection']>>, ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type EmbeddedHistoryEntryResolvers<ContextType = any, ParentType extends ResolversParentTypes['EmbeddedHistoryEntry'] = ResolversParentTypes['EmbeddedHistoryEntry']> = ResolversObject<{
  chapter?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  episode?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  lastTime?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  page?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  rating?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  startTime?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  status?: Resolver<Maybe<ResolversTypes['TrackerStatus']>, ParentType, ContextType>;
  timestamp?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  trackerIds?: Resolver<Maybe<Array<Maybe<ResolversTypes['Tracker']>>>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type EntryResolvers<ContextType = any, ParentType extends ResolversParentTypes['Entry'] = ResolversParentTypes['Entry']> = ResolversObject<{
  history?: Resolver<Maybe<ResolversTypes['EmbeddedHistoryEntry']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  info?: Resolver<ResolversTypes['EntryInfo'], ParentType, ContextType>;
  platforms?: Resolver<Array<Maybe<ResolversTypes['Platform']>>, ParentType, ContextType>;
  trackers?: Resolver<Array<Maybe<ResolversTypes['Tracker']>>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type EntryConnectionResolvers<ContextType = any, ParentType extends ResolversParentTypes['EntryConnection'] = ResolversParentTypes['EntryConnection']> = ResolversObject<{
  entry?: Resolver<Maybe<ResolversTypes['Entry']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type EntryInfoResolvers<ContextType = any, ParentType extends ResolversParentTypes['EntryInfo'] = ResolversParentTypes['EntryInfo']> = ResolversObject<{
  altTitles?: Resolver<Array<Maybe<ResolversTypes['String']>>, ParentType, ContextType>;
  anilist?: Resolver<Maybe<ResolversTypes['AnilistEntry']>, ParentType, ContextType>;
  author?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  cover?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  mal?: Resolver<Maybe<ResolversTypes['MALEntry']>, ParentType, ContextType>;
  nsfw?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  title?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type HistoryResolvers<ContextType = any, ParentType extends ResolversParentTypes['History'] = ResolversParentTypes['History']> = ResolversObject<{
  entries?: Resolver<Array<Maybe<ResolversTypes['HistoryEntry']>>, ParentType, ContextType>;
  mediaType?: Resolver<ResolversTypes['MediaType'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type HistoryEntryResolvers<ContextType = any, ParentType extends ResolversParentTypes['HistoryEntry'] = ResolversParentTypes['HistoryEntry']> = ResolversObject<{
  chapter?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  entry?: Resolver<Maybe<ResolversTypes['Entry']>, ParentType, ContextType>;
  episode?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  lastTime?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  page?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  rating?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  startTime?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  status?: Resolver<Maybe<ResolversTypes['TrackerStatus']>, ParentType, ContextType>;
  timestamp?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  trackerIds?: Resolver<Maybe<Array<Maybe<ResolversTypes['UserTracker']>>>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type LibraryResolvers<ContextType = any, ParentType extends ResolversParentTypes['Library'] = ResolversParentTypes['Library']> = ResolversObject<{
  categories?: Resolver<Array<Maybe<ResolversTypes['Category']>>, ParentType, ContextType>;
  mediaType?: Resolver<ResolversTypes['MediaType'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type MalAlternativeTitlesResolvers<ContextType = any, ParentType extends ResolversParentTypes['MALAlternativeTitles'] = ResolversParentTypes['MALAlternativeTitles']> = ResolversObject<{
  en?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  ja?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  synonyms?: Resolver<Maybe<Array<Maybe<ResolversTypes['String']>>>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type MalEntryResolvers<ContextType = any, ParentType extends ResolversParentTypes['MALEntry'] = ResolversParentTypes['MALEntry']> = ResolversObject<{
  alternativeTitles?: Resolver<Maybe<ResolversTypes['MALAlternativeTitles']>, ParentType, ContextType>;
  authors?: Resolver<Maybe<Array<Maybe<ResolversTypes['MALPerson']>>>, ParentType, ContextType>;
  background?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  endDate?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  genres?: Resolver<Array<Maybe<ResolversTypes['MALGenre']>>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  mainPicture?: Resolver<Maybe<ResolversTypes['MALPicture']>, ParentType, ContextType>;
  mean?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  mediaType?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  nsfw?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  numChapters?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  numListUsers?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  numScoringUsers?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  numVolumes?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  pictures?: Resolver<Array<Maybe<ResolversTypes['MALPicture']>>, ParentType, ContextType>;
  rank?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  recommendations?: Resolver<Array<Maybe<ResolversTypes['MALRecommendation']>>, ParentType, ContextType>;
  relatedAnime?: Resolver<Array<Maybe<ResolversTypes['MALRelation']>>, ParentType, ContextType>;
  relatedManga?: Resolver<Array<Maybe<ResolversTypes['MALRelation']>>, ParentType, ContextType>;
  startDate?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  status?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  synopsis?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  title?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type MalGenreResolvers<ContextType = any, ParentType extends ResolversParentTypes['MALGenre'] = ResolversParentTypes['MALGenre']> = ResolversObject<{
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type MalPersonResolvers<ContextType = any, ParentType extends ResolversParentTypes['MALPerson'] = ResolversParentTypes['MALPerson']> = ResolversObject<{
  info?: Resolver<ResolversTypes['MALPersonInfo'], ParentType, ContextType>;
  role?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type MalPersonInfoResolvers<ContextType = any, ParentType extends ResolversParentTypes['MALPersonInfo'] = ResolversParentTypes['MALPersonInfo']> = ResolversObject<{
  firstName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  lastName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type MalPictureResolvers<ContextType = any, ParentType extends ResolversParentTypes['MALPicture'] = ResolversParentTypes['MALPicture']> = ResolversObject<{
  large?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  medium?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type MalRecommendationResolvers<ContextType = any, ParentType extends ResolversParentTypes['MALRecommendation'] = ResolversParentTypes['MALRecommendation']> = ResolversObject<{
  node?: Resolver<ResolversTypes['MALShortEntry'], ParentType, ContextType>;
  numRecommendations?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type MalRelationResolvers<ContextType = any, ParentType extends ResolversParentTypes['MALRelation'] = ResolversParentTypes['MALRelation']> = ResolversObject<{
  node?: Resolver<ResolversTypes['MALShortEntry'], ParentType, ContextType>;
  relationType?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  relationTypeFormatted?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type MalShortEntryResolvers<ContextType = any, ParentType extends ResolversParentTypes['MALShortEntry'] = ResolversParentTypes['MALShortEntry']> = ResolversObject<{
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  mainPicture?: Resolver<Maybe<ResolversTypes['MALPicture']>, ParentType, ContextType>;
  title?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type MalUserResolvers<ContextType = any, ParentType extends ResolversParentTypes['MALUser'] = ResolversParentTypes['MALUser']> = ResolversObject<{
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  picture?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type MutationResolvers<ContextType = any, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = ResolversObject<{
  AddLibraryCategories?: Resolver<Maybe<ResolversTypes['Library']>, ParentType, ContextType, RequireFields<MutationAddLibraryCategoriesArgs, 'mediaType' | 'names'>>;
  AddLibraryCategory?: Resolver<Maybe<ResolversTypes['Library']>, ParentType, ContextType, RequireFields<MutationAddLibraryCategoryArgs, 'mediaType' | 'name'>>;
  AddLibraryItem?: Resolver<Maybe<ResolversTypes['Library']>, ParentType, ContextType, RequireFields<MutationAddLibraryItemArgs, 'id' | 'mediaType'>>;
  AddLibraryItemToCategory?: Resolver<Maybe<ResolversTypes['Library']>, ParentType, ContextType, RequireFields<MutationAddLibraryItemToCategoryArgs, 'category' | 'id' | 'mediaType'>>;
  AddLibraryItems?: Resolver<Maybe<ResolversTypes['Library']>, ParentType, ContextType, RequireFields<MutationAddLibraryItemsArgs, 'ids' | 'mediaType'>>;
  AddLibraryItemsToCategory?: Resolver<Maybe<ResolversTypes['Library']>, ParentType, ContextType, RequireFields<MutationAddLibraryItemsToCategoryArgs, 'category' | 'ids' | 'mediaType'>>;
  RemoveHistoryEntry?: Resolver<Maybe<ResolversTypes['History']>, ParentType, ContextType, RequireFields<MutationRemoveHistoryEntryArgs, 'id' | 'mediaType'>>;
  RemoveLibraryCategories?: Resolver<Maybe<ResolversTypes['Library']>, ParentType, ContextType, RequireFields<MutationRemoveLibraryCategoriesArgs, 'mediaType' | 'names'>>;
  RemoveLibraryCategory?: Resolver<Maybe<ResolversTypes['Library']>, ParentType, ContextType, RequireFields<MutationRemoveLibraryCategoryArgs, 'mediaType' | 'name'>>;
  RemoveLibraryItem?: Resolver<Maybe<ResolversTypes['Library']>, ParentType, ContextType, RequireFields<MutationRemoveLibraryItemArgs, 'id' | 'mediaType'>>;
  RemoveLibraryItemFromCategory?: Resolver<Maybe<ResolversTypes['Library']>, ParentType, ContextType, RequireFields<MutationRemoveLibraryItemFromCategoryArgs, 'category' | 'id' | 'mediaType'>>;
  RemoveLibraryItems?: Resolver<Maybe<ResolversTypes['Library']>, ParentType, ContextType, RequireFields<MutationRemoveLibraryItemsArgs, 'ids' | 'mediaType'>>;
  RemoveLibraryItemsFromCategory?: Resolver<Maybe<ResolversTypes['Library']>, ParentType, ContextType, RequireFields<MutationRemoveLibraryItemsFromCategoryArgs, 'category' | 'ids' | 'mediaType'>>;
  RemoveLink?: Resolver<Maybe<ResolversTypes['EntryConnection']>, ParentType, ContextType, RequireFields<MutationRemoveLinkArgs, 'id' | 'mediaType' | 'platform' | 'source'>>;
  SetHistoryEntry?: Resolver<Maybe<ResolversTypes['HistoryEntry']>, ParentType, ContextType, RequireFields<MutationSetHistoryEntryArgs, 'id' | 'mediaType'>>;
  SetLink?: Resolver<Maybe<ResolversTypes['EntryConnection']>, ParentType, ContextType, RequireFields<MutationSetLinkArgs, 'id' | 'mediaType' | 'platform' | 'source' | 'sourceId'>>;
}>;

export type PlatformResolvers<ContextType = any, ParentType extends ResolversParentTypes['Platform'] = ResolversParentTypes['Platform']> = ResolversObject<{
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  sources?: Resolver<Array<Maybe<ResolversTypes['Source']>>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type QueryResolvers<ContextType = any, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = ResolversObject<{
  Entries?: Resolver<Array<Maybe<ResolversTypes['Entry']>>, ParentType, ContextType, RequireFields<QueryEntriesArgs, 'ids' | 'mediaType'>>;
  Entry?: Resolver<Maybe<ResolversTypes['Entry']>, ParentType, ContextType, RequireFields<QueryEntryArgs, 'id' | 'mediaType'>>;
  Histories?: Resolver<Array<Maybe<ResolversTypes['History']>>, ParentType, ContextType>;
  History?: Resolver<Maybe<ResolversTypes['History']>, ParentType, ContextType, RequireFields<QueryHistoryArgs, 'mediaType'>>;
  HistoryEntries?: Resolver<Array<Maybe<ResolversTypes['HistoryEntry']>>, ParentType, ContextType, RequireFields<QueryHistoryEntriesArgs, 'ids' | 'mediaType'>>;
  HistoryEntry?: Resolver<Maybe<ResolversTypes['HistoryEntry']>, ParentType, ContextType, RequireFields<QueryHistoryEntryArgs, 'id' | 'mediaType'>>;
  Libraries?: Resolver<Array<Maybe<ResolversTypes['Library']>>, ParentType, ContextType>;
  Library?: Resolver<Maybe<ResolversTypes['Library']>, ParentType, ContextType, RequireFields<QueryLibraryArgs, 'mediaType'>>;
  Link?: Resolver<Maybe<ResolversTypes['EntryConnection']>, ParentType, ContextType, RequireFields<QueryLinkArgs, 'mediaType' | 'platform' | 'source' | 'sourceId'>>;
  Search?: Resolver<Array<Maybe<ResolversTypes['Entry']>>, ParentType, ContextType, RequireFields<QuerySearchArgs, 'mediaType' | 'query'>>;
  User?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType, Partial<QueryUserArgs>>;
  Users?: Resolver<Array<Maybe<ResolversTypes['User']>>, ParentType, ContextType, RequireFields<QueryUsersArgs, 'ids'>>;
}>;

export type SourceResolvers<ContextType = any, ParentType extends ResolversParentTypes['Source'] = ResolversParentTypes['Source']> = ResolversObject<{
  id?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  user?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type TrackerResolvers<ContextType = any, ParentType extends ResolversParentTypes['Tracker'] = ResolversParentTypes['Tracker']> = ResolversObject<{
  id?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  user?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type UserResolvers<ContextType = any, ParentType extends ResolversParentTypes['User'] = ResolversParentTypes['User']> = ResolversObject<{
  data?: Resolver<ResolversTypes['UserData'], ParentType, ContextType>;
  discord?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type UserDataResolvers<ContextType = any, ParentType extends ResolversParentTypes['UserData'] = ResolversParentTypes['UserData']> = ResolversObject<{
  anilist?: Resolver<Maybe<ResolversTypes['AnilistUser']>, ParentType, ContextType>;
  history?: Resolver<Maybe<Array<Maybe<ResolversTypes['History']>>>, ParentType, ContextType>;
  library?: Resolver<Maybe<Array<Maybe<ResolversTypes['Library']>>>, ParentType, ContextType>;
  mal?: Resolver<Maybe<ResolversTypes['MALUser']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type UserTrackerResolvers<ContextType = any, ParentType extends ResolversParentTypes['UserTracker'] = ResolversParentTypes['UserTracker']> = ResolversObject<{
  id?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type Resolvers<ContextType = any> = ResolversObject<{
  AnilistAiringSchedule?: AnilistAiringScheduleResolvers<ContextType>;
  AnilistCharacter?: AnilistCharacterResolvers<ContextType>;
  AnilistCharacterImage?: AnilistCharacterImageResolvers<ContextType>;
  AnilistCharacterName?: AnilistCharacterNameResolvers<ContextType>;
  AnilistEntry?: AnilistEntryResolvers<ContextType>;
  AnilistFuzzyDate?: AnilistFuzzyDateResolvers<ContextType>;
  AnilistMediaCoverImage?: AnilistMediaCoverImageResolvers<ContextType>;
  AnilistMediaExternalLink?: AnilistMediaExternalLinkResolvers<ContextType>;
  AnilistMediaRank?: AnilistMediaRankResolvers<ContextType>;
  AnilistMediaStats?: AnilistMediaStatsResolvers<ContextType>;
  AnilistMediaStreamingEpisode?: AnilistMediaStreamingEpisodeResolvers<ContextType>;
  AnilistMediaTag?: AnilistMediaTagResolvers<ContextType>;
  AnilistMediaTitle?: AnilistMediaTitleResolvers<ContextType>;
  AnilistRecommendation?: AnilistRecommendationResolvers<ContextType>;
  AnilistScoreDistribution?: AnilistScoreDistributionResolvers<ContextType>;
  AnilistStaff?: AnilistStaffResolvers<ContextType>;
  AnilistStaffImage?: AnilistStaffImageResolvers<ContextType>;
  AnilistStaffName?: AnilistStaffNameResolvers<ContextType>;
  AnilistStatusDistribution?: AnilistStatusDistributionResolvers<ContextType>;
  AnilistStudio?: AnilistStudioResolvers<ContextType>;
  AnilistTrailer?: AnilistTrailerResolvers<ContextType>;
  AnilistUser?: AnilistUserResolvers<ContextType>;
  AnilistUserAvatar?: AnilistUserAvatarResolvers<ContextType>;
  Category?: CategoryResolvers<ContextType>;
  EmbeddedHistoryEntry?: EmbeddedHistoryEntryResolvers<ContextType>;
  Entry?: EntryResolvers<ContextType>;
  EntryConnection?: EntryConnectionResolvers<ContextType>;
  EntryInfo?: EntryInfoResolvers<ContextType>;
  History?: HistoryResolvers<ContextType>;
  HistoryEntry?: HistoryEntryResolvers<ContextType>;
  Library?: LibraryResolvers<ContextType>;
  MALAlternativeTitles?: MalAlternativeTitlesResolvers<ContextType>;
  MALEntry?: MalEntryResolvers<ContextType>;
  MALGenre?: MalGenreResolvers<ContextType>;
  MALPerson?: MalPersonResolvers<ContextType>;
  MALPersonInfo?: MalPersonInfoResolvers<ContextType>;
  MALPicture?: MalPictureResolvers<ContextType>;
  MALRecommendation?: MalRecommendationResolvers<ContextType>;
  MALRelation?: MalRelationResolvers<ContextType>;
  MALShortEntry?: MalShortEntryResolvers<ContextType>;
  MALUser?: MalUserResolvers<ContextType>;
  Mutation?: MutationResolvers<ContextType>;
  Platform?: PlatformResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  Source?: SourceResolvers<ContextType>;
  Tracker?: TrackerResolvers<ContextType>;
  User?: UserResolvers<ContextType>;
  UserData?: UserDataResolvers<ContextType>;
  UserTracker?: UserTrackerResolvers<ContextType>;
}>;

