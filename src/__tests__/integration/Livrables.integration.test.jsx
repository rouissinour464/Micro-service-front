import { render, screen } from "@testing-library/react";
import Livrables from "../../pages/etudiant/livrables";
import * as stageService from "../../services/stageService";

jest.mock("../../services/stageService");

test("affiche les livrables quand le service retourne des données", async () => {
  stageService.getMesLivrables.mockResolvedValue([
    {
      id: 1,
      titre: "Rapport final",
      nomFichier: "rapport.pdf",
    },
  ]);

  render(<Livrables />);

  expect(await screen.findByText(/Rapport final/i)).toBeInTheDocument();
  expect(screen.getByText(/rapport.pdf/i)).toBeInTheDocument();
});