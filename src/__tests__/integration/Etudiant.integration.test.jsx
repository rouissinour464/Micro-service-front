import { render, screen } from "@testing-library/react";

// Pages Étudiant
import Livrables from "../../pages/etudiant/livrables";
import Offres from "../../pages/etudiant/offres";

// Services
import * as stageService from "../../services/stageService";

// Mock global
jest.mock("../../services/stageService");

describe("Tests d’intégration – Étudiant", () => {

  test("Livrables : affiche les données retournées par le service", async () => {
    stageService.getMesLivrables.mockResolvedValue([
      {
        id: 1,
        titre: "Rapport final",
        nomFichier: "rapport.pdf",
      },
    ]);

    render(<Livrables />);

    expect(
      await screen.findByText(/Rapport final/i)
    ).toBeInTheDocument();

    expect(
      screen.getByText(/rapport.pdf/i)
    ).toBeInTheDocument();
  });

  test("Offres : affiche les offres retournées par le service", async () => {
    stageService.getOffresActives.mockResolvedValue([
      {
        id: 1,
        titre: "Stage Développement Web",
      },
    ]);

    render(<Offres />);

    expect(
      await screen.findByText(/Stage Développement Web/i)
    ).toBeInTheDocument();
  });

});