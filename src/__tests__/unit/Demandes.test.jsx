import { render, screen, cleanup } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

jest.mock("../../services/stageService", () => ({
  __esModule: true,
  getMesDemandes:  jest.fn(),
  getEncadrants:   jest.fn(),
  soumettreDemande: jest.fn(),
  choisirEncadrant: jest.fn(),
}));

import * as stageService from "../../services/stageService";
import Demandes from "../../pages/etudiant/demandes";

afterEach(() => {
  cleanup();
  jest.clearAllMocks();
});

test("aucune demande → affiche bouton sans erreur", async () => {
  stageService.getMesDemandes.mockResolvedValue([]);
  stageService.getEncadrants.mockResolvedValue([]);

  render(
    <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Demandes />
    </MemoryRouter>
  );

  expect(
    await screen.findByText(/nouvelle demande/i)
  ).toBeInTheDocument();

  expect(
    screen.queryByText(/impossible de charger/i)
  ).not.toBeInTheDocument();
});

test("demande existante → affiche le titre", async () => {
  stageService.getMesDemandes.mockResolvedValue([
    { id: 1, titreProjet: "Mon stage IA", status: "EN_ATTENTE", imageDemandeUrl: null },
  ]);
  stageService.getEncadrants.mockResolvedValue([]);

  render(
    <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Demandes />
    </MemoryRouter>
  );

  expect(
    await screen.findByText(/mon stage ia/i)
  ).toBeInTheDocument();
});