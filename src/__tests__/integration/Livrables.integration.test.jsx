import { render, screen, cleanup } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

jest.mock("../../services/stageService", () => ({
  __esModule: true,
  getMesLivrables: jest.fn(),
  getMesDemandes:  jest.fn(),
  deposerLivrable: jest.fn(),
  deleteLivrable:  jest.fn(),
}));

import * as stageService from "../../services/stageService";
import Livrables from "../../pages/etudiant/livrables";

afterEach(() => {
  cleanup();
  jest.clearAllMocks();
});

test("livrables OK → affiche le titre", async () => {
  stageService.getMesLivrables.mockResolvedValue([
    { id: 1, titre: "Rapport final", typeLivrable: "RAPPORT", createdAt: "2024-06-01" },
  ]);
  stageService.getMesDemandes.mockResolvedValue([]);

  render(
    <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Livrables />
    </MemoryRouter>
  );

  expect(
    await screen.findByText(/rapport final/i)
  ).toBeInTheDocument();
});

test("aucun livrable → affiche message vide", async () => {
  stageService.getMesLivrables.mockResolvedValue([]);
  stageService.getMesDemandes.mockResolvedValue([]);

  render(
    <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Livrables />
    </MemoryRouter>
  );

  expect(
    await screen.findByText(/aucun livrable déposé/i)
  ).toBeInTheDocument();
});

test("erreur réseau → affiche alerte erreur", async () => {
  stageService.getMesLivrables.mockRejectedValue(new Error("Network Error"));
  stageService.getMesDemandes.mockRejectedValue(new Error("Network Error"));

  render(
    <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Livrables />
    </MemoryRouter>
  );

  expect(
    await screen.findByText(/impossible de charger les données/i)
  ).toBeInTheDocument();
});