import { screen } from "@testing-library/react";
import type { UserEvent } from "@testing-library/user-event";

// Drives a Base UI <Select>: opens the trigger by its accessible name, then
// clicks the option with the given visible label. Replaces the native
// `user.selectOptions`, which only works on real <select> elements.
export async function selectOption(
  user: UserEvent,
  triggerName: string | RegExp,
  optionLabel: string | RegExp,
): Promise<void> {
  await user.click(screen.getByLabelText(triggerName));
  const option = await screen.findByRole("option", { name: optionLabel });
  await user.click(option);
}
