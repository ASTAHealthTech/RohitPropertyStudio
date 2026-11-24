import type { Block } from "../../lib/catalog";

/**
 * Renders text imported from the published 100yards.in pages: paragraphs, sub-headings,
 * lists, tables and questions. The words are the published ones; this only lays them out.
 */
export function Blocks({ blocks, caption }: { blocks: Block[]; caption: string }) {
  return (
    <div className="pblocks">
      {blocks.map((block, i) => {
        if (block.t === "p") return <p key={i}>{block.x}</p>;
        if (block.t === "h2") return <h2 key={i}>{block.x}</h2>;
        if (block.t === "h") return <h3 key={i}>{block.x}</h3>;
        if (block.t === "list") {
          const short = block.items.length > 5 && block.items.every((item) => item.length < 64);
          return <ul key={i} className={short ? "pblocks__cols" : undefined}>{block.items.map((item, j) => <li key={j}>{item}</li>)}</ul>;
        }
        if (block.t === "qa") return <details key={i}><summary>{block.q}<span aria-hidden="true">+</span></summary><p>{block.a}</p></details>;
        const [head, ...body] = block.rows;
        return (
          <div className="ptable__wrap" key={i}>
            <table className="ptable">
              <caption className="sr-only">{caption}</caption>
              <thead><tr>{head.map((cell, j) => <th key={j} scope="col">{cell}</th>)}</tr></thead>
              <tbody>{body.map((row, r) => <tr key={r}>{row.map((cell, j) => <td key={j} data-label={head[j]}>{cell}</td>)}</tr>)}</tbody>
            </table>
          </div>
        );
      })}
    </div>
  );
}
