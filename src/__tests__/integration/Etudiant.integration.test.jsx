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

  test("Livrables OK → affiche le titre", async () => {
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

  test("Demandes OK → affiche le titre de la demande", async () => {
    stageService.getMesDemandes.mockResolvedValue([
      { id: 1, titreProjet: "Stage Développement Web", status: "EN_ATTENTE", imageDemandeUrl: null },
    ]);
    stageService.getEncadrants.mockResolvedValue([]);

    render(
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Demandes />
      </MemoryRouter>
    );

    expect(
      await screen.findByText(/stage développement web/i)
    ).toBeInTheDocument();
  });

  test("Livrables vides → affiche message vide", async () => {
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

  test("Erreur réseau → affiche alerte dans Demandes", async () => {
    stageService.getMesDemandes.mockRejectedValue(new Error("Network Error"));
    stageService.getEncadrants.mockRejectedValue(new Error("Network Error"));

    render(
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Demandes />
      </MemoryRouter>
    );

    expect(
      await screen.findByText(/impossible de charger les données/i)
    ).toBeInTheDocument();
  });
});