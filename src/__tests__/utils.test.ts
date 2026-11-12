import { describe, expect, it } from "vitest";
import { extractLinkedInJobId, linkedInSearchUrl, normalizeJobUrl } from "../utils/linkedin";
import { csvToJobs, parseCsv } from "../utils/csv";
import { detectSource, jobSource, parseSource } from "../utils/source";
import { sourceCounts } from "../utils/filterSort";
import { seedState } from "../store/storage";

describe("source", () => {
  it("detects the job site from the link", () => {
    expect(detectSource("https://www.linkedin.com/jobs/view/4477605013")).toBe("LinkedIn");
    expect(detectSource("https://ca.linkedin.com/jobs/view/x-123")).toBe("LinkedIn");
    expect(detectSource("https://to.indeed.com/aansrjthmm2q")).toBe("Indeed");
    expect(detectSource("https://ca.indeed.com/viewjob?jk=abc")).toBe("Indeed");
    expect(detectSource("https://www.eluta.ca/spl/some-job-123")).toBe("Eluta");
    expect(detectSource("https://www.glassdoor.ca/job-listing/x")).toBe("Glassdoor");
    expect(detectSource("https://www.jobbank.gc.ca/jobsearch/jobposting/1")).toBe("Job Bank");
    expect(detectSource("https://careers.example.com/job/1")).toBeUndefined();
    expect(detectSource("https://notlinkedin.com/jobs")).toBeUndefined();
    expect(detectSource("not a url")).toBeUndefined();
    expect(detectSource(undefined)).toBeUndefined();
  });

  it("prefers a saved source, then the link, then Other", () => {
    expect(jobSource({ source: "Referral", url: "https://www.linkedin.com/jobs/view/1" })).toBe("Referral");
    expect(jobSource({ url: "https://www.linkedin.com/jobs/view/1" })).toBe("LinkedIn");
    expect(jobSource({ url: "https://careers.example.com/1" })).toBe("Other");
    expect(jobSource({})).toBe("Other");
  });

  it("reads typed source names", () => {
    expect(parseSource("linkedin")).toBe("LinkedIn");
    expect(parseSource(" Job bank ")).toBe("Job Bank");
    expect(parseSource("company site")).toBe("Company site");
    expect(parseSource("Monster")).toBe("Other");
    expect(parseSource("")).toBeUndefined();
  });

  it("counts the seed jobs by source", () => {
    expect(sourceCounts(seedState().friends[0].jobs)).toEqual([
      { source: "LinkedIn", count: 45 },
      { source: "Indeed", count: 6 },
      { source: "Eluta", count: 10 },
    ]);
  });
});

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
