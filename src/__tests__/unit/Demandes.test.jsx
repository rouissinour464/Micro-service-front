import { render, screen } from "@testing-library/react";
import Demandes from "../../pages/etudiant/demandes";
import * as stageService from "../../services/stageService";

jest.mock("../../services/stageService");

test("affiche le message quand aucune demande n'est retournée", async () => {
  stageService.getMesDemandes.mockResolvedValue([]);

  render(<Demandes />);

  const message = await screen.findByText(/Aucune demande soumise/i);
  expect(message).toBeInTheDocument();
});
