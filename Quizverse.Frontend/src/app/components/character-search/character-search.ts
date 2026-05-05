import { Component, computed, ElementRef, EventEmitter, HostListener, Input, OnInit, Output, signal, ViewChild } from '@angular/core';
import { ICharacter } from '../../models/character';
import { CommonModule } from '@angular/common';
import { Image, Landmark, Laugh, LucideAngularModule, MessageSquareQuote, Search, X } from "lucide-angular";
import { PlayButton } from '../play-button/play-button';
import { CharacterSearchService } from '../../services/character-search.service';
import { IGuessResult } from './models/guess-result';
import { ClassicGuessResultComponent } from '../../pages/game-modes/classic/widgets/classic-guess-result/classic-guess-result';
import { GuessResult } from "../../pages/game-modes/widgets/guess-result/guess-result";
import { Router } from '@angular/router';

@Component({
  selector: 'app-character-search',
  imports: [CommonModule, ClassicGuessResultComponent, PlayButton, LucideAngularModule, GuessResult],
  templateUrl: './character-search.html',
  styleUrl: './character-search.scss'
})
export class CharacterSearch implements OnInit {
  @ViewChild('dropdownWrapper', { read: ElementRef, static: false }) dropdownWrapper?: ElementRef<HTMLElement>;
  @ViewChild('gameOverElement', { read: ElementRef, static: false }) gameOverElement?: ElementRef<HTMLElement>;
  @Output() gameOver = new EventEmitter<void>();
  @Input({ required: true }) gameMode!: string;
  @Input({ required: true }) characterSearchService!: CharacterSearchService;
  public readonly MessageSquareQuote = MessageSquareQuote;
  public readonly Laugh = Laugh;
  public readonly Image = Image;
  public readonly Landmark = Landmark;
  public readonly Search = Search;
  public readonly X = X;
  public showIconCircle = false;
  public searchText = signal('');
  public showDropdown = signal(false);
  public isGameOver = signal(false);
  public guessHistory = signal<IGuessResult[]>([]);
  public tries = signal(0);
  public timeLeft = '';
  public highlightedIndex = signal(-1);
  public errorMessage = signal('');
  private errorTimeout: ReturnType<typeof setTimeout> | null = null;

  constructor(private readonly router: Router) { }

  ngOnInit() {
    this.isGameOver = this.characterSearchService.isGameOver;
    this.guessHistory = this.characterSearchService.guessHistory;
    this.tries = this.characterSearchService.tries;
    this.timeLeft = this.characterSearchService.timeLeft;

    this.updateShowPlayButtonIcon();
    window.addEventListener('resize', () => this.updateShowPlayButtonIcon());
  }

  makeGuess(guessedCharacter: ICharacter): void {
    const correct = this.characterSearchService.correctCharacter();

    if (!correct || this.characterSearchService.isGameOver()) return;

    const alreadyGuessed = this.characterSearchService.guessHistory().some(g => g.character.id === guessedCharacter.id);
    if (alreadyGuessed) {
      this.flashError('Personagem já adicionado na lista.');
      return;
    }

    this.characterSearchService.tries.update(t => {
      const next = t + 1;
      this.characterSearchService.triesChange.emit(next);
      return next;
    });

    const isCorrect = btoa(guessedCharacter.id.toString()) === this.characterSearchService.correctCharacterHash;

    let result: IGuessResult;
    if (this.gameMode == 'classic') {
      const episodeDiff = Math.abs((guessedCharacter.episodeCount ?? 0) - (correct.episodeCount ?? 0));

      let episodeMatch: 'exact' | 'close' | 'far' = 'far';
      if (episodeDiff === 0) {
        episodeMatch = 'exact';
      } else if (episodeDiff <= 10) {
        episodeMatch = 'close';
      }

      result = {
        character: guessedCharacter,
        isCorrect,
        matches: {
          status: guessedCharacter.status === correct.status,
          species: guessedCharacter.species === correct.species,
          gender: guessedCharacter.gender === correct.gender,
          origin: guessedCharacter.origin.name === correct.origin.name,
          location: guessedCharacter.location.name === correct.location.name,
          episodeCount: episodeMatch
        }
      };
    } else {
      result = {
        character: guessedCharacter,
        isCorrect,
      };
    }

    this.characterSearchService.guessHistory.update(history => [result, ...history]);
    this.characterSearchService.updateAvailableCharacters(guessedCharacter);
    this.characterSearchService.saveGameState();

    if (isCorrect) {
      this.characterSearchService.isGameOver.set(true);
      this.characterSearchService.saveGameState();
      setTimeout(() => {
        this.gameOverElement?.nativeElement?.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }, 100);
    }

    this.searchText.set('');
    this.showDropdown.set(false);
    this.highlightedIndex.set(-1);
  }

  filteredInputCharacters = computed(() => {
    const query = this.searchText().toLowerCase();

    const available = this.characterSearchService.availableCharacters();
    if (!Array.isArray(available)) return [];

    if (!query) return available;

    return available
      .filter(character => character.name.toLowerCase().includes(query))
      .sort((a, b) => {
        const nameA = a.name.toLowerCase();
        const nameB = b.name.toLowerCase();

        const aStarts = nameA.startsWith(query) ? 0 : 1;
        const bStarts = nameB.startsWith(query) ? 0 : 1;

        if (aStarts !== bStarts) return aStarts - bStarts;

        return nameA.localeCompare(nameB);
      });
  });

  @HostListener('document:click', ['$event'])
  handleClickOutside(event: MouseEvent): void {
    const el = this.dropdownWrapper?.nativeElement;
    if (!el) return;

    if (!el.contains(event.target as Node)) {
      this.showDropdown.set(false);
      this.highlightedIndex.set(-1);
    }
  }

  onInputChange(value: string): void {
    this.searchText.set(value);
    this.highlightedIndex.set(-1);
    if (!this.showDropdown()) {
      this.showDropdown.set(true);
    }
  }

  clearSearch(): void {
    this.searchText.set('');
    this.highlightedIndex.set(-1);
    this.showDropdown.set(true);
  }

  onSearchKeydown(event: KeyboardEvent): void {
    const list = this.filteredInputCharacters();
    if (!list.length) return;

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.showDropdown.set(true);
      const next = this.highlightedIndex() + 1;
      this.highlightedIndex.set(next >= list.length ? 0 : next);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.showDropdown.set(true);
      const prev = this.highlightedIndex() - 1;
      this.highlightedIndex.set(prev < 0 ? list.length - 1 : prev);
    } else if (event.key === 'Enter') {
      const idx = this.highlightedIndex();
      if (idx >= 0 && idx < list.length) {
        event.preventDefault();
        this.makeGuess(list[idx]);
      }
    } else if (event.key === 'Escape') {
      this.showDropdown.set(false);
      this.highlightedIndex.set(-1);
    }
  }

  private flashError(message: string): void {
    this.errorMessage.set(message);
    if (this.errorTimeout) clearTimeout(this.errorTimeout);
    this.errorTimeout = setTimeout(() => this.errorMessage.set(''), 2500);
  }

  updateShowPlayButtonIcon() {
    this.showIconCircle = window.innerWidth >= 1024;
  }

  navigateTo(url: string) {
    this.router.navigate([url]);
  }
}
