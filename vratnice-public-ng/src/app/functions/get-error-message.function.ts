export function getErrorMessage(error: any): string{
    const keys = Object.keys(error.error);
    if (error.error && error.error.message) {
      const message = error.error.message;

     // Hledání klíče "message" a extrakce textu zprávy uvnitř
      const messageMatch = message.match(/"message":"([^"]+)"/);
      
      if (messageMatch && messageMatch.length > 1) {
        // Vrátíme nalezenou chybovou zprávu
        return messageMatch[1];
      }
  
      // Definujte regulární výraz pro extrakci chybové zprávy mezi \" a \"\""
      const regex = /"([^"]*)""/;
  
      // Použijte regulární výraz pro extrakci zprávy
      const match = message.match(regex);
      if (match && match.length > 1) {
        return match[1];
      } else {
        const parts = message.split(': ');
        if(parts.length > 1) {
          const lastPart = parts[parts.length - 1];
          const trimmedLastPart = lastPart.slice(0, -1);
          return trimmedLastPart;
        }
        return parts[parts.length-1];
      }
    } else if (keys.length > 0) {
      const firstKey = keys[0];
      const value = error.error[firstKey];
      return value;
    } 

    return "Vznikla nezmapovaná chyba na serveru. Akci opakujte později."
    
  }