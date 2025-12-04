export class CreateJavelinFeedbackDto {
    /** Nombre del remitente */
    name!: string;

    /** Correo electrónico del remitente */
    email!: string;

    /** Segmento de cliente */
    customerSegment!: string;

    /** Problema percibido */
    problemDescription!: string;

    /** Por qué el problema importa */
    whyImportant!: string;

    /** Señales actuales que indican el problema */
    currentSignals!: string;

    /** Comentarios adicionales */
    additionalComments?: string;
}
