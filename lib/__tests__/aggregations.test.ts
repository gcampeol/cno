import { describe, it, expect } from "vitest";
import { generateObras } from "../mock-data";
import {
  computeKpis,
  countByBairro,
  countByTipologia,
  countByUf,
} from "../aggregations";

const obras = generateObras(2000, 42);

describe("generateObras", () => {
  it("gera a quantidade pedida", () => {
    expect(obras).toHaveLength(2000);
  });

  it("é determinístico para a mesma seed", () => {
    const a = generateObras(100, 7);
    const b = generateObras(100, 7);
    expect(a).toEqual(b);
  });

  it("nunca expõe nome de PF (LGPD)", () => {
    for (const o of obras) {
      if (o.responsavelTipo === "PF") expect(o.responsavelNome).toBeNull();
      else expect(o.responsavelNome).not.toBeNull();
    }
  });
});

describe("computeKpis", () => {
  const kpis = computeKpis(obras);

  it("conta o total de obras", () => {
    expect(kpis.obras).toBe(2000);
  });

  it("PJ + PF somam o total", () => {
    expect(kpis.responsaveisPJ + kpis.responsaveisPF).toBe(2000);
  });

  it("metragem total bate com a soma manual", () => {
    const soma = obras.reduce((s, o) => s + o.metragem, 0);
    expect(kpis.metragemTotal).toBe(soma);
  });

  it("obras ativas não excede o total", () => {
    expect(kpis.obrasAtivas).toBeGreaterThan(0);
    expect(kpis.obrasAtivas).toBeLessThanOrEqual(2000);
  });

  it("obras novas é um subconjunto do total", () => {
    expect(kpis.obrasNovas).toBeGreaterThanOrEqual(0);
    expect(kpis.obrasNovas).toBeLessThanOrEqual(2000);
  });
});

describe("countByTipologia", () => {
  const donut = countByTipologia(obras);

  it("vem ordenado por quantidade desc", () => {
    for (let i = 1; i < donut.length; i++) {
      expect(donut[i - 1].quantidade).toBeGreaterThanOrEqual(
        donut[i].quantidade,
      );
    }
  });

  it("Residencial é a maior fatia", () => {
    expect(donut[0].categoria).toBe("Residencial");
  });

  it("os percentuais somam ~100", () => {
    const soma = donut.reduce((s, d) => s + d.percentual, 0);
    expect(soma).toBeCloseTo(100, 5);
  });
});

describe("countByUf / countByBairro", () => {
  it("SP é a UF com mais obras", () => {
    const uf = countByUf(obras);
    expect(uf[0].nome).toBe("SP");
  });

  it("a maior linha tem proporção 1", () => {
    const uf = countByUf(obras);
    expect(uf[0].proporcao).toBe(1);
  });

  it("Centro é o bairro dominante", () => {
    const bairros = countByBairro(obras);
    expect(bairros[0].nome).toBe("Centro");
  });
});
