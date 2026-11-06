import source from './content.json';

export type JournalPageKind='intro'|'roots'|'travel'|'football'|'stadium'|'formula'|'stocks'|'geopolitics'|'valorant'|'movies'|'philosophy'|'research'|'sports'|'fitness';
export type JournalLink={href:string;label:string};
export type JournalPhoto={image:string;alt:string;label:string;note:string;shape:string};
export type JournalPage={
  number:string;kind:JournalPageKind;texture:string;kicker:string;title:string;body:string;
  note?:string;aside?:string;image?:string;alt?:string;photos?:JournalPhoto[];
  topics?:string[];link?:JournalLink;
  project?:{title:string;body:string;tools:string;href:string;label:string};
};
export type JournalSceneKind='journey'|'travel'|'football'|'formula'|'markets'|'world'|'valorant'|'cinema'|'curiosity'|'sports';
export type JournalSpread={id:string;label:string;scene:JournalSceneKind;summary:string;link?:JournalLink;left:JournalPage;right:JournalPage};
const content=source as {title:string;spreads:JournalSpread[]};
export const journalPages=content.spreads.flatMap(spread=>[spread.left,spread.right]);
export default content;
