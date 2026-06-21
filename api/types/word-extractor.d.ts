declare module "word-extractor" {
  export default class WordExtractor {
    extract(input: Buffer | string): Promise<{
      getBody(): string;
      getHeaders(options?: { includeFooters?: boolean }): string;
      getFootnotes(): string;
      getEndnotes(): string;
      getAnnotations(): string;
      getTextboxes(): string;
    }>;
  }
}
