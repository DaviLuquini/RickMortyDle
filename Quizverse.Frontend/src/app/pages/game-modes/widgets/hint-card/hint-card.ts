import { Component, Input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Image, Lightbulb } from "lucide-angular";
import { ICharacter } from '../../../../models/character';

@Component({
  selector: 'app-hint-card',
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './hint-card.html',
  styleUrl: './hint-card.scss'
})
export class HintCard {
  @Input({ required: true }) tries = 0;
  @Input({ required: true }) correctCharacter!: ICharacter;

  public readonly Math = Math;
  public readonly Image = Image;
  public readonly Lightbulb = Lightbulb;

  public letterHintClicked = signal(false);
  public imageHintClicked = signal(false);

  get letterHintAttempts(): number {
    return Math.max(0, 5 - this.tries);
  }

  get imageHintAttempts(): number {
    return Math.max(0, 10 - this.tries);
  }

  get showLetterHint(): string {
    return this.letterHintClicked() ? this.correctCharacter.name.charAt(0) : "?";
  }

  get showImageHint(): string {
    return this.imageHintClicked() ? this.correctCharacter.image : '';
  }

  onLetterHintClick(): void {
    if (this.letterHintAttempts === 0) {
      this.letterHintClicked.set(true);
    }
  }

  onImageHintClick(): void {
    if (this.imageHintAttempts === 0) {
      this.imageHintClicked.set(true);
    }
  }
}