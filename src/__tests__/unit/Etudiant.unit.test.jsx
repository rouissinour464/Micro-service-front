import { render, screen } from "@testing-library/react";

// Pages Étudiant
import Demandes from "../../pages/etudiant/demandes";
import Livrables from "../../pages/etudiant/livrables";
import Soutenance from "../../pages/etudiant/soutenance";

// Services
import * as stageService from "../../services/stageService";

// Mock global
jest.mock("../../services/stageService");

describe("Tests unitaires – Étudiant", () => {

  test("Demandes : affiche un message quand aucune demande n'existe", async () => {
    stageService.getMesDemandes.mockResolvedValue([]);

    render(<Demandes />);

    expect(
      await screen.findByText(/Aucune demande soumise/i)
    ).toBeInTheDocument();
  });

  test("Livrables : affiche un message quand aucun livrable n'existe", async () => {
    stageService.getMesLivrables.mockResolvedValue([]);

    render(<Livrables />);

    expect(
      await screen.findByText(/Aucun livrable déposé/i)
    ).toBeInTheDocument();
  });

  test("Soutenance : affiche un message quand aucune soutenance n'est planifiée", async () => {
    stageService.getMaSoutenance.mockResolvedValue(null);

    render(<Soutenance />);

    expect(
      await screen.findByText(/Aucune soutenance planifiée/i)
    ).toBeInTheDocument();
  });

});