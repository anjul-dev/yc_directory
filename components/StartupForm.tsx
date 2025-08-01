"use client";

import React, { useState, useActionState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import MDEditor from "@uiw/react-md-editor";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import { formSchema } from "@/lib/validation";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { createPitch } from "@/lib/actions";

const StartupForm = () => {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pitch, setPitch] = useState("");
  const [formValues, setFormValues] = useState({
    title: "",
    description: "",
    category: "",
    link: "",
  });

  const { toast } = useToast();
  const router = useRouter();

  const handleInputChange = (field: string, value: string) => {
    let sanitized = value;

    // Remove leading whitespace
    sanitized = sanitized.replace(/^\s+/, "");

    // Replace multiple spaces with a single space
    sanitized = sanitized.replace(/\s{2,}/g, " ");

    // Prevent starting with number or special character
    if (
      sanitized.length === 1 &&
      field !== "link" &&
      !/^[A-Za-z]$/.test(sanitized)
    ) {
      return;
    }

    // Enforce max lengths
    if (field === "title" && sanitized.length > 100) return;
    if (field === "description" && sanitized.length > 500) return;
    if (field === "category" && sanitized.length > 20) return;

    setFormValues((prev) => ({ ...prev, [field]: sanitized }));
  };

  const handleFormSubmit = async (prevState: any, formData: FormData) => {
    try {
      const values = {
        ...formValues,
        pitch,
      };

      await formSchema.parseAsync(values);

      const result = await createPitch(prevState, formData, pitch);

      if (result.status == "SUCCESS") {
        toast({
          title: "Success",
          description: "Your startup pitch has been created successfully",
        });
      }

      return result;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors = error.flatten().fieldErrors;
        setErrors(fieldErrors as Record<string, string>);

        toast({
          title: "Error",
          description: "Please check your inputs and try again",
          variant: "destructive",
        });

        return { ...prevState, error: "Validation failed", status: "ERROR" };
      }

      toast({
        title: "Error",
        description: "An unexpected error has occurred",
        variant: "destructive",
      });

      return {
        ...prevState,
        error: "An unexpected error has occurred",
        status: "ERROR",
      };
    }
  };

  const [state, formAction, isPending] = useActionState(handleFormSubmit, {
    error: "",
    status: "INITIAL",
  });

  useEffect(() => {
    if (state.status === "SUCCESS" && state._id) {
      router.push(`/startup/${state._id}`);
    }
  }, [state, router]);

  return (
    <form action={formAction} className="startup-form">
      {/* Title */}
      <div>
        <label htmlFor="title" className="startup-form_label">
          Title
        </label>
        <Input
          id="title"
          name="title"
          className="startup-form_input"
          required
          placeholder="Startup Title"
          value={formValues.title}
          onChange={(e) => handleInputChange("title", e.target.value)}
        />
        {errors.title && <p className="startup-form_error">{errors.title}</p>}
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="startup-form_label">
          Description
        </label>
        <Textarea
          id="description"
          name="description"
          className="startup-form_textarea"
          required
          placeholder="Startup Description"
          value={formValues.description}
          onChange={(e) => handleInputChange("description", e.target.value)}
        />
        {errors.description && (
          <p className="startup-form_error">{errors.description}</p>
        )}
      </div>

      {/* Category */}
      <div>
        <label htmlFor="category" className="startup-form_label">
          Category
        </label>
        <Input
          id="category"
          name="category"
          className="startup-form_input"
          required
          placeholder="Startup Category (Tech, Health, Education...)"
          value={formValues.category}
          onChange={(e) => handleInputChange("category", e.target.value)}
        />
        {errors.category && (
          <p className="startup-form_error">{errors.category}</p>
        )}
      </div>

      {/* Image Link */}
      <div>
        <label htmlFor="link" className="startup-form_label">
          Image URL
        </label>
        <Input
          id="link"
          name="link"
          className="startup-form_input"
          required
          placeholder="Startup Image URL"
          value={formValues.link}
          onChange={(e) => handleInputChange("link", e.target.value)}
        />
        {errors.link && <p className="startup-form_error">{errors.link}</p>}
      </div>

      {/* Pitch Markdown */}
      <div data-color-mode="light">
        <label htmlFor="pitch" className="startup-form_label">
          Pitch
        </label>
        <MDEditor
          value={pitch}
          onChange={(value) => setPitch(value || "")}
          id="pitch"
          preview="edit"
          height={300}
          style={{ borderRadius: 20, overflow: "hidden" }}
          textareaProps={{
            placeholder:
              "Briefly describe your idea and what problem it solves",
          }}
          previewOptions={{
            disallowedElements: ["style"],
          }}
        />
        {errors.pitch && <p className="startup-form_error">{errors.pitch}</p>}
      </div>

      <Button
        type="submit"
        className="startup-form_btn text-white"
        disabled={isPending}
      >
        {isPending ? "Submitting..." : "Submit Your Pitch"}
        <Send className="size-6 ml-2" />
      </Button>
    </form>
  );
};

export default StartupForm;
