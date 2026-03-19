import { useState } from "react";

const PRODUCTS = [
  "Body Shave / Razor",
  "Deodorant",
  "Body Wash",
  "Face Wash",
  "Moisturizer",
  "Shampoo",
  "Conditioner",
  "Sunscreen",
  "Lip Balm",
  "Custom Product",
];

const TONES = ["Fun & Playful", "Bold & Confident", "Clean & Minimal", "Luxury & Premium", "Friendly & Warm", "Edgy & Modern"];
const AUDIENCES = [
  "Men 18-35, active lifestyle",
  "Women 25-40, health-conscious",
  "Gen Z 18-24, trend-driven",
  "Parents 30-45, family-focused",
  "Athletes & gym-goers",
  "Professionals 25-45",
  "Custom audience",
];
const PLATFORMS = ["Facebook Feed", "Instagram Feed", "Instagram Stories", "Facebook & Instagram (All)"];

interface AdResult {
  headline: string;
  primaryText: string;
  description: string;
  cta: string;
  story: string;
  carousel: { headline: string; body: string }[];
  imagePrompt: string;
  audienceInsight: string;
  hooks: string[];
}

interface SavedAd {
  id: number;
  product: string;
  brand: string;
  result: AdResult;
  timestamp: string;
}

function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      style={{ padding: "4px 10px", borderRadius: 6, border: "1px solid #e2e8f0", background: copied ? "#dcfce7" : "#f8fafc", color: copied ? "#16a34a" : "#64748b", fontSize: 11, cursor: "pointer", fontWeight: 600, transition: "all 0.2s" }}>
      {copied ? "✓ Copied" : "Copy"}
    </button>
  );
}

function AdCard({ label, content, accent }: { label: string; content: string; accent?: string }) {
  return (
    <div style={{ background: "#fff", borderRadius: 12, padding: 16, border: `1px solid ${accent || "#e2e8f0"}`, marginBottom: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: accent || "#94a3b8", textTransform: "uppercase", letterSpacing: 1 }}>{label}</span>
        <CopyBtn text={content} />
      </div>
      <p style={{ margin: 0, fontSize: 14, color: "#1e293b", lineHeight: 1.6 }}>{content}</p>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: "block", fontSize: 12, fontWeight: 700, color: "#64748b",
  marginBottom: 6, marginTop: 14, textTransform: "uppercase", letterSpacing: 0.5,
};
const inputStyle: React.CSSProperties = {
  width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #e2e8f0",
  background: "#f8fafc", fontSize: 14, color: "#1e293b", boxSizing: "border-box", outline: "none",
};
const selectStyle: React.CSSProperties = {
  width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #e2e8f0",
  background: "#f8fafc", fontSize: 14, color: "#1e293b", boxSizing: "border-box", outline: "none", cursor: "pointer",
};

export default function App() {
  const [product, setProduct] = useState("");
  const [customProduct, setCustomProduct] = useState("");
  const [brand, setBrand] = useState("");
  const [audience, setAudience] = useState(AUDIENCES[0]);
  const [customAudience, setCustomAudience] = useState("");
  const [tone, setTone] = useState(TONES[0]);
  const [platform, setPlatform] = useState(PLATFORMS[3]);
  const [offer, setOffer] = useState("");
  const [loading, setLoading] = useState(false);
  const [rateLimited, setRateLimited] = useState(false);
  const [result, setResult] = useState<AdResult | null>(null);
  const [savedAds, setSavedAds] = useState<SavedAd[]>([]);
  const [tab, setTab] = useState<"generate" | "saved">("generate");
  const [activeCarousel, setActiveCarousel] = useState(0);
  const [error, setError] = useState("");

  const finalProduct = product === "Custom Product" ? customProduct : product;
  const finalAudience = audience === "Custom audience" ? customAudience : audience;

  async function generate() {
    if (!finalProduct) { setError("Please select or enter a product."); return; }
    setError("");
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product: finalProduct, brand, audience: finalAudience,
          tone, platform, offer, formats: ["Feed", "Story", "Carousel"],
        }),
      });
      if (res.status === 429) {
        setRateLimited(true);
        setLoading(false);
        setTimeout(() => setRateLimited(false), 60000);
        return;
      }
      const data = await res.json();
      if (data.error) { setError(data.error); setLoading(false); return; }
      setResult(data);
      setActiveCarousel(0);
    } catch {
      setError("Something went wrong. Please try again.");
    }
    setLoading(false);
  }

  function saveAd() {
    if (!result) return;
    setSavedAds(prev => [{
      id: Date.now(),
      product: finalProduct,
      brand,
      result,
      timestamp: new Date().toLocaleString(),
    }, ...prev]);
    alert("Ad saved!");
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", fontFamily: "system-ui, -apple-system, sans-serif" }}>

      {/* Header */}
      <div style={{ background: "#fff", borderBottom: "1px solid #e2e8f0", padding: "16px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, zIndex: 100, boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 800, background: "linear-gradient(135deg, #667eea, #764ba2)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            ✨ Ad Studio
          </div>
          <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 1 }}>AI-Powered Meta Ad Copy Generator</div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {(["generate", "saved"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              style={{ padding: "8px 18px", borderRadius: 8, border: "none", background: tab === t ? "linear-gradient(135deg, #667eea, #764ba2)" : "#f1f5f9", color: tab === t ? "#fff" : "#64748b", fontWeight: 600, cursor: "pointer", fontSize: 13 }}>
              {t === "generate" ? "Generate" : `Saved (${savedAds.length})`}
            </button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 960, margin: "0 auto", padding: "24px 16px" }}>

        {/* GENERATE TAB */}
        {tab === "generate" && (
          <div style={{ display: "grid", gridTemplateColumns: "380px 1fr", gap: 24 }}>

            {/* Left: Form */}
            <div style={{ background: "#fff", borderRadius: 16, padding: 24, border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.04)", height: "fit-content", position: "sticky", top: 80 }}>
              <h2 style={{ margin: "0 0 4px", fontSize: 17, fontWeight: 700, color: "#1e293b" }}>Campaign Brief</h2>
              <p style={{ margin: "0 0 16px", fontSize: 12, color: "#94a3b8" }}>Fill in the details to generate your Meta ads</p>

              <label style={labelStyle}>Product *</label>
              <select value={product} onChange={e => setProduct(e.target.value)} style={selectStyle}>
                <option value="">Select a product...</option>
                {PRODUCTS.map(p => <option key={p}>{p}</option>)}
              </select>
              {product === "Custom Product" && (
                <input placeholder="Enter your product name" value={customProduct} onChange={e => setCustomProduct(e.target.value)}
                  style={{ ...inputStyle, marginTop: 8 }} />
              )}

              <label style={labelStyle}>Brand Name</label>
              <input placeholder="e.g. Gillette, Dove, Native..." value={brand} onChange={e => setBrand(e.target.value)} style={inputStyle} />

              <label style={labelStyle}>Target Audience</label>
              <select value={audience} onChange={e => setAudience(e.target.value)} style={selectStyle}>
                {AUDIENCES.map(a => <option key={a}>{a}</option>)}
              </select>
              {audience === "Custom audience" && (
                <input placeholder="Describe your audience..." value={customAudience} onChange={e => setCustomAudience(e.target.value)}
                  style={{ ...inputStyle, marginTop: 8 }} />
              )}

              <label style={labelStyle}>Ad Tone</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 4 }}>
                {TONES.map(t => (
                  <button key={t} onClick={() => setTone(t)}
                    style={{ padding: "5px 10px", borderRadius: 20, border: `1.5px solid ${tone === t ? "#667eea" : "#e2e8f0"}`, background: tone === t ? "#667eea11" : "#fff", color: tone === t ? "#667eea" : "#64748b", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>
                    {t}
                  </button>
                ))}
              </div>

              <label style={labelStyle}>Platform</label>
              <select value={platform} onChange={e => setPlatform(e.target.value)} style={selectStyle}>
                {PLATFORMS.map(p => <option key={p}>{p}</option>)}
              </select>

              <label style={labelStyle}>Special Offer / USP</label>
              <input placeholder="e.g. 20% off, Free shipping, New formula..." value={offer} onChange={e => setOffer(e.target.value)} style={inputStyle} />

              {error && <div style={{ color: "#ef4444", fontSize: 13, margin: "10px 0" }}>{error}</div>}

              <button onClick={generate} disabled={loading || rateLimited}
                style={{ width: "100%", padding: 14, borderRadius: 10, border: "none", background: rateLimited ? "#fef3c7" : "linear-gradient(135deg, #667eea, #764ba2)", color: rateLimited ? "#92400e" : "#fff", fontWeight: 700, fontSize: 15, cursor: loading ? "wait" : "pointer", opacity: loading ? 0.8 : 1, marginTop: 16, transition: "opacity 0.2s" }}>
                {loading ? "✨ Generating..." : rateLimited ? "⏳ Rate limited — try again in 1 min" : "✨ Generate Ad Copy"}
              </button>
            </div>

            {/* Right: Results */}
            <div>
              {!result && !loading && (
                <div style={{ background: "#fff", borderRadius: 16, padding: 60, border: "1px dashed #e2e8f0", textAlign: "center" }}>
                  <div style={{ fontSize: 56, marginBottom: 16 }}>🎯</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: "#94a3b8" }}>Your Meta ad copy will appear here</div>
                  <div style={{ fontSize: 14, color: "#cbd5e1", marginTop: 8 }}>Fill in the brief on the left and click Generate</div>
                  <div style={{ display: "flex", gap: 16, justifyContent: "center", marginTop: 24, flexWrap: "wrap" }}>
                    {["📱 Feed Ad", "📸 Stories", "🎠 Carousel", "🎣 A/B Hooks", "🎨 Image Prompt"].map(f => (
                      <div key={f} style={{ padding: "8px 16px", background: "#f1f5f9", borderRadius: 20, fontSize: 13, color: "#64748b", fontWeight: 600 }}>{f}</div>
                    ))}
                  </div>
                </div>
              )}

              {loading && (
                <div style={{ background: "#fff", borderRadius: 16, padding: 60, border: "1px solid #e2e8f0", textAlign: "center" }}>
                  <div style={{ fontSize: 48, marginBottom: 16 }}>⚡</div>
                  <div style={{ fontSize: 17, fontWeight: 700, color: "#667eea" }}>AI is crafting your ads...</div>
                  <div style={{ fontSize: 13, color: "#94a3b8", marginTop: 8 }}>Analyzing product, audience & platform best practices</div>
                </div>
              )}

              {result && (
                <div>
                  {/* Audience insight banner */}
                  <div style={{ background: "linear-gradient(135deg, #667eea, #764ba2)", borderRadius: 12, padding: 16, marginBottom: 16, color: "#fff" }}>
                    <div style={{ fontSize: 11, fontWeight: 700, opacity: 0.8, marginBottom: 4 }}>💡 AUDIENCE INSIGHT</div>
                    <div style={{ fontSize: 13, lineHeight: 1.5 }}>{result.audienceInsight}</div>
                  </div>

                  {/* Feed Ad Preview + Copy */}
                  <div style={{ background: "#fff", borderRadius: 14, padding: 20, border: "1px solid #e2e8f0", marginBottom: 16 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#667eea", marginBottom: 14, textTransform: "uppercase", letterSpacing: 1 }}>📱 Feed Ad</div>

                    {/* Mock FB post preview */}
                    <div style={{ background: "#f0f2f5", borderRadius: 10, padding: 14, marginBottom: 14, maxWidth: 400 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                        <div style={{ width: 38, height: 38, borderRadius: "50%", background: "linear-gradient(135deg, #667eea, #764ba2)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 15, flexShrink: 0 }}>
                          {(brand || finalProduct || "A")[0].toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 13, color: "#1c1e21" }}>{brand || finalProduct}</div>
                          <div style={{ fontSize: 11, color: "#65676b" }}>Sponsored · <span style={{ fontSize: 10 }}>🌐</span></div>
                        </div>
                      </div>
                      <div style={{ fontSize: 14, color: "#1c1e21", lineHeight: 1.5, marginBottom: 10 }}>{result.primaryText}</div>
                      <div style={{ height: 160, background: "linear-gradient(135deg, #667eea33, #764ba233)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 0, border: "1px solid #667eea22" }}>
                        <div style={{ textAlign: "center", color: "#667eea" }}>
                          <div style={{ fontSize: 28, marginBottom: 4 }}>🖼️</div>
                          <div style={{ fontSize: 12, fontWeight: 600 }}>Ad Creative</div>
                        </div>
                      </div>
                      <div style={{ background: "#e4e6eb", padding: "10px 12px", display: "flex", justifyContent: "space-between", alignItems: "center", borderRadius: "0 0 8px 8px" }}>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: "#1c1e21" }}>{result.headline}</div>
                          <div style={{ fontSize: 11, color: "#65676b" }}>{result.description}</div>
                        </div>
                        <div style={{ background: "#1877f2", borderRadius: 6, padding: "6px 14px", fontSize: 13, fontWeight: 700, color: "#fff", whiteSpace: "nowrap", marginLeft: 8 }}>
                          {result.cta}
                        </div>
                      </div>
                    </div>

                    <AdCard label="Headline" content={result.headline} accent="#667eea" />
                    <AdCard label="Primary Text" content={result.primaryText} />
                    <AdCard label="Description" content={result.description} />
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <span style={{ fontSize: 12, color: "#64748b", fontWeight: 600 }}>CTA:</span>
                      <span style={{ background: "#1877f222", color: "#1877f2", padding: "4px 12px", borderRadius: 6, fontSize: 13, fontWeight: 700 }}>{result.cta}</span>
                    </div>
                  </div>

                  {/* Story */}
                  <div style={{ background: "#fff", borderRadius: 14, padding: 20, border: "1px solid #e2e8f0", marginBottom: 16 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#ec4899", marginBottom: 14, textTransform: "uppercase", letterSpacing: 1 }}>📸 Story / Reel Hook</div>
                    <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                      <div style={{ background: "linear-gradient(180deg, #f472b6, #a855f7)", borderRadius: 14, padding: 20, width: 120, minHeight: 200, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <div style={{ fontSize: 14, fontWeight: 800, color: "#fff", textAlign: "center", lineHeight: 1.4 }}>{result.story}</div>
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, color: "#64748b", marginBottom: 8 }}>Story hook text (overlay on creative):</div>
                        <div style={{ background: "#fdf4ff", borderRadius: 10, padding: 14, border: "1px solid #f0abfc", marginBottom: 10 }}>
                          <p style={{ margin: 0, fontSize: 14, color: "#1e293b", fontWeight: 600, lineHeight: 1.5 }}>{result.story}</p>
                        </div>
                        <CopyBtn text={result.story} />
                      </div>
                    </div>
                  </div>

                  {/* Carousel */}
                  <div style={{ background: "#fff", borderRadius: 14, padding: 20, border: "1px solid #e2e8f0", marginBottom: 16 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#f59e0b", marginBottom: 14, textTransform: "uppercase", letterSpacing: 1 }}>🎠 Carousel Cards</div>
                    <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
                      {result.carousel.map((_, i) => (
                        <button key={i} onClick={() => setActiveCarousel(i)}
                          style={{ flex: 1, padding: "8px", borderRadius: 8, border: `2px solid ${activeCarousel === i ? "#f59e0b" : "#e2e8f0"}`, background: activeCarousel === i ? "#fffbeb" : "#fff", color: activeCarousel === i ? "#92400e" : "#64748b", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
                          Card {i + 1}
                        </button>
                      ))}
                    </div>
                    {result.carousel[activeCarousel] && (
                      <div style={{ background: "#fffbeb", borderRadius: 10, padding: 16, border: "1px solid #fde68a" }}>
                        <div style={{ fontWeight: 700, fontSize: 15, color: "#1e293b", marginBottom: 6 }}>{result.carousel[activeCarousel].headline}</div>
                        <div style={{ fontSize: 13, color: "#64748b", lineHeight: 1.5 }}>{result.carousel[activeCarousel].body}</div>
                        <div style={{ marginTop: 10 }}><CopyBtn text={`${result.carousel[activeCarousel].headline}\n${result.carousel[activeCarousel].body}`} /></div>
                      </div>
                    )}
                  </div>

                  {/* Hook variants */}
                  <div style={{ background: "#fff", borderRadius: 14, padding: 20, border: "1px solid #e2e8f0", marginBottom: 16 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#10b981", marginBottom: 4, textTransform: "uppercase", letterSpacing: 1 }}>🎣 Hook Variants</div>
                    <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 12 }}>Use these for A/B testing different opening lines</div>
                    {result.hooks.map((hook, i) => (
                      <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 14px", background: i % 2 === 0 ? "#f0fdf4" : "#f8fafc", borderRadius: 8, marginBottom: 8, border: "1px solid #e2e8f0" }}>
                        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                          <span style={{ background: "#10b981", color: "#fff", borderRadius: "50%", width: 20, height: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, flexShrink: 0 }}>{i + 1}</span>
                          <span style={{ fontSize: 13, color: "#1e293b" }}>{hook}</span>
                        </div>
                        <CopyBtn text={hook} />
                      </div>
                    ))}
                  </div>

                  {/* Image Prompt */}
                  <div style={{ background: "#fff", borderRadius: 14, padding: 20, border: "1px solid #e2e8f0", marginBottom: 16 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#8b5cf6", marginBottom: 4, textTransform: "uppercase", letterSpacing: 1 }}>🎨 Creative Image Prompt</div>
                    <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 12 }}>Copy into DALL-E, Midjourney, or Adobe Firefly</div>
                    <div style={{ background: "#f5f3ff", borderRadius: 10, padding: 16, border: "1px solid #ddd6fe", marginBottom: 10 }}>
                      <p style={{ margin: 0, fontSize: 13, color: "#4c1d95", lineHeight: 1.7, fontStyle: "italic" }}>{result.imagePrompt}</p>
                    </div>
                    <CopyBtn text={result.imagePrompt} />
                  </div>

                  {/* Save button */}
                  <button onClick={saveAd}
                    style={{ width: "100%", padding: 14, borderRadius: 10, border: "2px solid #667eea", background: "transparent", color: "#667eea", fontWeight: 700, fontSize: 15, cursor: "pointer" }}>
                    💾 Save Ad Set
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* SAVED TAB */}
        {tab === "saved" && (
          <div>
            {savedAds.length === 0 ? (
              <div style={{ background: "#fff", borderRadius: 16, padding: 60, textAlign: "center", border: "1px dashed #e2e8f0" }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>💾</div>
                <div style={{ fontSize: 16, fontWeight: 600, color: "#94a3b8" }}>No saved ads yet</div>
                <div style={{ fontSize: 13, color: "#cbd5e1", marginTop: 8 }}>Generate ads and click "Save Ad Set"</div>
              </div>
            ) : savedAds.map(ad => (
              <div key={ad.id} style={{ background: "#fff", borderRadius: 14, padding: 20, marginBottom: 14, border: "1px solid #e2e8f0" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 16, color: "#1e293b" }}>{ad.brand || ad.product}</div>
                    <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>{ad.product} · Saved {ad.timestamp}</div>
                  </div>
                  <button onClick={() => setSavedAds(prev => prev.filter(s => s.id !== ad.id))}
                    style={{ padding: "5px 12px", borderRadius: 6, border: "1px solid #fecaca", background: "#fef2f2", color: "#ef4444", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                    Delete
                  </button>
                </div>
                <AdCard label="Headline" content={ad.result.headline} accent="#667eea" />
                <AdCard label="Primary Text" content={ad.result.primaryText} />
                <AdCard label="Story Hook" content={ad.result.story} accent="#ec4899" />
                <div style={{ marginTop: 8 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>Hook Variants</div>
                  {ad.result.hooks.map((h, i) => (
                    <div key={i} style={{ fontSize: 13, color: "#64748b", padding: "6px 0", borderBottom: "1px solid #f1f5f9" }}>{i + 1}. {h}</div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
