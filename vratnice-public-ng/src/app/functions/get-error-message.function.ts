export function getErrorMessage(error: any): string{
    const keys = Object.keys(error.error);
    if (error.error && error.error.message) {
      const message = error.error.message;
  
      // Definujte regulární výraz pro extrakci chybové zprávy mezi \" a \"\""
      const regex = /"([^"]*)""/;
  
      // Použijte regulární výraz pro extrakci zprávy
      const match = message.match(regex);
      if (match && match.length > 1) {
        return match[1];
      }
    } else if (keys.length > 0) {
      const firstKey = keys[0];
      const value = error.error[firstKey];
      return value
    } 

    return "Vznikla nezmapovaná chyba na serveru. Akci opakujte později."
    
  }