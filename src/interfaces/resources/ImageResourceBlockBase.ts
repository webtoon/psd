// @webtoon/psd
// Copyright 2021-present NAVER WEBTOON
// MIT License

export interface ImageResourceBlockBase<ResourceId extends number, Resource> {
  id: ResourceId;
  name: string;
  resource: Resource;
}
