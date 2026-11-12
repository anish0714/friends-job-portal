import { describe, expect, it } from "vitest";
import { extractLinkedInJobId, linkedInSearchUrl, normalizeJobUrl } from "../utils/linkedin";
import { csvToJobs, parseCsv } from "../utils/csv";

describe("linkedin", () => {
  it("extracts job ids from common LinkedIn URL shapes", () => {
    expect(extractLinkedInJobId("https://www.linkedin.com/jobs/view/4477605013/?refId=abc&trk=x")).toBe("4477605013");
    expect(extractLinkedInJobId("https://ca.linkedin.com/jobs/view/senior-java-developer-at-cgi-4448487756")).toBe("4448487756");
    expect(extractLinkedInJobId("https://www.linkedin.com/jobs/search/?currentJobId=4489039147&keywords=java")).toBe("4489039147");
    expect(extractLinkedInJobId("https://example.com/jobs/view/4489039147")).toBeNull();
  });

  it("normalises LinkedIn links and leaves others alone", () => {
    expect(normalizeJobUrl(" https://www.linkedin.com/jobs/view/4477605013/?trk=abc ")).toBe("https://www.linkedin.com/jobs/view/4477605013");
    expect(normalizeJobUrl("https://careers.example.com/job/1")).toBe("https://careers.example.com/job/1");
  });

  it("builds the search URL from the headline before the first ·", () => {
    expect(linkedInSearchUrl({ headline: "Senior Engineer · Java", location: "Toronto, ON" })).toBe(
      "https://www.linkedin.com/jobs/search/?keywords=Senior%20Engineer&location=Toronto%2C%20ON&f_TPR=r604800",
    );
  });
});

describe("csv", () => {
  it("parses quoted fields with commas, quotes and newlines", () => {
    expect(parseCsv('a,b\n"x, y","say ""hi""\nthere"\r\n')).toEqual([
      ["a", "b"],
      ["x, y", 'say "hi"\nthere'],
    ]);
  });

  it("converts CSV rows into jobs", () => {
    const text = [
      "title,company,location,posted,salary,url,match,fit,gaps",
      'Dev,"Acme, Inc.",Toronto,2026-11-01,"$100,000",https://www.linkedin.com/jobs/view/1234567890/?trk=x,strong,Java,Kafka',
      ",Missing title,,,,,,,",
    ].join("\n");
    const jobs = csvToJobs(text);
    expect(jobs).toHaveLength(1);
    expect(jobs[0]).toMatchObject({
      id: "1234567890",
      title: "Dev",
      company: "Acme, Inc.",
      salary: "$100,000",
      url: "https://www.linkedin.com/jobs/view/1234567890",
      match: "Strong",
      fit: "Java",
      gaps: "Kafka",
    });
  });
});
