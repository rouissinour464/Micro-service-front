import { render, screen, cleanup } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

jest.mock("../../services/stageService", () => ({
  __esModule: true,
  getMesDemandes:   jest.fn(),
  getEncadrants:    jest.fn(),
  getMesLivrables:  jest.fn(),
  deposerLivrable:  jest.fn(),
  deleteLivrable:   jest.fn(),
  soumettreDemande: jest.fn(),
  choisirEncadrant: jest.fn(),
}));

import * as stageService from "../../services/stageService";
import Demandes from "../../pages/etudiant/demandes";
import Livrables from "../../pages/etudiant/livrables";

afterEach(() => {
  cleanup();
  jest.clearAllMocks();
});

describe("Tests Étudiant", () => {

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
      { id: 1, titreProjet: "Stage Data Science", status: "EN_ATTENTE", imageDemandeUrl: null },
    ]);
    stageService.getEncadrants.mockResolvedValue([]);

    render(
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Demandes />
      </MemoryRouter>
    );

    expect(
      await screen.findByText(/stage data science/i)
    ).toBeInTheDocument();
  });

  test("livrables → affiche le titre du livrable", async () => {
    stageService.getMesLivrables.mockResolvedValue([
      { id: 1, titre: "Rapport final", typeLivrable: "RAPPORT", createdAt: "2024-01-01" },
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
});