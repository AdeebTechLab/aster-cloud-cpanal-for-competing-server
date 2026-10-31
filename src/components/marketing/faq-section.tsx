import { faqItems } from "@/data/landing-page";
import { SectionEyebrow } from "@/components/ui/section-eyebrow";

export function FaqSection() {
  return (
    <section className="faq-section" id="support">
      <div className="content-width faq-inner">
        <div className="section-heading centered faq-heading">
          <SectionEyebrow label="Help center" small />
          <h2>Frequently Asked Questions</h2>
          <p>
            Find answers to common questions about our cloud infrastructure,
            deployment process, pricing, and support.
          </p>
        </div>
        <div className="faq-list">
          {faqItems.map(({ question, answer, open }) => (
            <details
              key={question}
              className={`faq-item ${open ? "open" : ""}`}
              open={open}
            >
              <summary className="faq-question-row">
                <h3>{question}</h3>
                <span className="faq-toggle" aria-hidden="true" />
              </summary>
              <div className="faq-answer">
                <p>{answer}</p>
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
