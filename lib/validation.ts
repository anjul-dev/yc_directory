import { z } from "zod";

// Common validation functions
const noLeadingWhitespace = (val: string) => !/^\s/.test(val);
const singleSpacesOnly = (val: string) => !/\s{2,}/.test(val);
const startsWithAlphabet = (val: string) => /^[A-Za-z]/.test(val);

// Custom validations
const customTextValidation = z
  .string()
  .min(3)
  .max(100)
  .refine(noLeadingWhitespace, {
    message: "Cannot start with whitespace",
  })
  .refine(singleSpacesOnly, {
    message: "Only one space allowed between words",
  })
  .refine(startsWithAlphabet, {
    message: "Must start with an alphabet",
  });

const customCategoryValidation = z
  .string()
  .min(3)
  .max(20)
  .refine(noLeadingWhitespace, {
    message: "Cannot start with whitespace",
  })
  .refine(singleSpacesOnly, {
    message: "Only one space allowed between words",
  })
  .refine(startsWithAlphabet, {
    message: "Must start with an alphabet",
  });

// Schema
export const formSchema = z.object({
  title: customTextValidation,
  description: z
    .string()
    .min(20)
    .max(500)
    .refine(noLeadingWhitespace, {
      message: "Cannot start with whitespace",
    })
    .refine(singleSpacesOnly, {
      message: "Only one space allowed between words",
    })
    .refine(startsWithAlphabet, {
      message: "Must start with an alphabet",
    }),
  category: customCategoryValidation,
  link: z
    .string()
    .url({ message: "Invalid URL format" })
    .refine(async (url) => {
      try {
        const res = await fetch(url, { method: "HEAD" });
        const contentType = res.headers.get("content-type");
        return contentType?.startsWith("image/");
      } catch {
        return false;
      }
    }, { message: "URL must point to a valid image" }),
  pitch: z
    .string()
    .min(10, { message: "Pitch must be at least 10 characters" })
    .refine(noLeadingWhitespace, {
      message: "Cannot start with whitespace",
    })
    .refine(singleSpacesOnly, {
      message: "Only one space allowed between words",
    })
    .refine(startsWithAlphabet, {
      message: "Must start with an alphabet",
    }),
});
