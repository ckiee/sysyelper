import { load } from "cheerio";
import fetch from "node-fetch";
import { URL } from "url";
import { logger } from "./logger";

export type ComicSource = keyof typeof fetchers;
export type ComicFetcher = (_: URL) => () => Promise<ComicMetadata>;

interface ComicPage {
    title: string;
    url: string;
}
interface ComicMetadata {
    title: string;
    bannerURL: string; // not actually consistently banner, but we started off with a banner.
    pages: ComicPage[];
}

export function isComicSource(val: string): val is ComicSource {
    return Object.keys(fetchers).includes(val);
}

export const fetchers = {
    comicfury: <ComicFetcher>function makeComicfuryFetcher(comicUrl: URL) {
        return async function fetchComicfury() {
            const url = new URL(comicUrl.toString());
            url.pathname = "archive";
            logger.trace(`GET ${url}`);
            const res = await fetch(url);
            const html = await res.text();
            const $ = load(html);
            let pages: { id: number, title: string, url: string }[] = [];

            $(".archivecomic > a").each((_, e) => {
                const url = new URL(comicUrl.toString());
                const rawUrl = $(e).attr("href");
                if (!rawUrl || rawUrl.trim() == "") return;
                url.pathname = rawUrl;
                const title = $(e).text();
                pages.push({
                    title,
                    url: url.toString(),
                    id: parseInt(rawUrl.split("/")[2], 10),
                });
            });

            pages = pages.sort((a, b) => a.id - b.id);

            const bannerURL = $("div#banner img").attr("src");
            const title = $("h1#sitetitle").text().trim();

            if (!bannerURL || !title)
                throw new Error("Failed to parse archive page meta");

            return {
                pages,
                bannerURL,
                title,
            };
        };
    },
    webtoons: <ComicFetcher>function makeWebtoonsFetcher(comicUrl: URL) {
        return async function fetchWebtoons() {
            const url = new URL(comicUrl.toString());
            url.pathname = [...url.pathname.split("/").slice(0, 4), "list"].join("/");
            url.searchParams.delete("episode_no");
            logger.trace(`GET ${url}`);
            const res = await fetch(url);
            const html = await res.text();
            const $ = load(html);
            const pages: ComicPage[] = [];

            $("#_listUl > li > a").each((_, e) => {
                const url = $(e).attr("href");
                if (!url || url.trim() == "") return;
                const title = $(e).children(".subj").text();
                pages.push({ url, title });
            });

            const bannerURL = $(".detail_header > .thmb > img").attr("src");
            const title = $("._challengeTitle").text().trim();

            if (!bannerURL || !title)
                throw new Error("Failed to parse archive page meta");

            return {
                pages,
                bannerURL,
                title,
            };
        };
    },
} as const;
