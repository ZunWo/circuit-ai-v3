export default function ImageCredit({ credit }) {
  if (!credit) return null;
  return (
    <p className="image-credit">
      <span>ภาพ: {credit.author} · </span>
      <a href={credit.source} target="_blank" rel="noreferrer">
        ต้นฉบับ
      </a>
      <span> · </span>
      <a href={credit.licenseUrl} target="_blank" rel="noreferrer">
        {credit.license}
      </a>
    </p>
  );
}
