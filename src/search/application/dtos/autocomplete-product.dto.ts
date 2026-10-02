import { IsNotEmpty, IsString } from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";

export class AutocompleteProductDto {
    @ApiPropertyOptional({ example: 'lap', description: 'Text to search for autocomplete suggestions' })
    @IsString()
    @IsNotEmpty()
    text: string;
}