// import User from "./";

// describe("User", () => {
//   it("renders a button", () => {
//     render(<Cart onCancel={console.log} />);
//     const button = screen.getByRole("button");
//     expect(button).toBeInTheDocument();
//   });

//   it("no renders thank you at the beginning", () => {
//     render(<Cart onCancel={console.log} />);
//     expect(screen.queryByText("Thank you !")).not.toBeInTheDocument();
//   });

//   it("renders thank you after click", () => {
//     render(<Cart onCancel={console.log} />);
//     const button = screen.getByRole("button");
//     fireEvent.click(button);
//     expect(screen.getByText("Thank you !")).toBeInTheDocument();
//   });

//   it.only("renders thank you after click on cancel button", () => {
//     const onCancel = jest.fn();
//     render(<Cart onCancel={onCancel} />);
//     const button: HTMLElement = screen.getByText("Cancel");
//     fireEvent.click(button);
//     expect(onCancel).toHaveBeenCalledTimes(1);
//   });
// });
