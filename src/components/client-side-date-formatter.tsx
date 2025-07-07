
"use client";

import { useState, useEffect } from 'react';
import { format, parseISO, isValid } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ClientSideDateFormatterProps {
  isoDateString?: string;
  placeholderText?: string;
}

export function ClientSideDateFormatter({ isoDateString, placeholderText = "..." }: ClientSideDateFormatterProps) {
  const [formattedDate, setFormattedDate] = useState<string>(placeholderText);

  useEffect(() => {
    if (isoDateString && isValid(parseISO(isoDateString))) {
      try {
        // This formatting happens only on the client after hydration
        setFormattedDate(format(parseISO(isoDateString), 'dd/MM/yyyy HH:mm', { locale: ptBR }));
      } catch (e) {
        console.error("Error formatting date:", e);
        setFormattedDate("Erro data"); // Fallback for error during formatting
      }
    } else if (isoDateString) { // If isoDateString is provided but invalid
        setFormattedDate("Data inválida");
    } else { // If isoDateString is undefined/null
        setFormattedDate("N/A");
    }
  }, [isoDateString, placeholderText]);

  // On the server and initial client render, `formattedDate` will be `placeholderText`.
  // After hydration and useEffect runs, it will be updated to the formatted date or error/fallback.
  return <>{formattedDate}</>;
}
