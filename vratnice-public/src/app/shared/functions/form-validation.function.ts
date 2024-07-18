import { NgForm } from "@angular/forms";

export function formValidationFunction(form?: NgForm): boolean {
  if (!form) {
    return true;
  }

  if (form.pending) {
    return false;
  }
  if (form.invalid) {
    Object.keys(form.control.controls).forEach(field => {
      const control = form.control.get(field);
      // console.log("control", control);
      control?.markAsDirty({ onlySelf: true });
    });
    return false;
  }

  return true;
}
