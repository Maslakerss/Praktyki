import { Component, OnInit, Input, Renderer2, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { StorageService } from 'src/app/shared/storage.service/storage.service';

import { AlertController, Platform } from '@ionic/angular';


@Component({
  selector: 'app-line-selector-new',
  templateUrl: './line-selector-new.component.html',
  styleUrls: ['./line-selector-new.component.scss'],
})
export class LineSelectorNewComponent {

  @Input() screenWidth: string;
  @Input() chessLessons: string;
  @Input() standardArrayOfLessons: string;
  @Input() graphicSetup: string;
  @Input() actualLesson: string;
  @Input() lesson: number;

  @Input() lessonLeft: string;

  actualLessonData: any;

  private tileClickListener: () => void;

  constructor(private storageService: StorageService,private platform: Platform, public alertController: AlertController, public router: Router, private renderer: Renderer2) {
    this.platform.ready().then(() => {
        this.screenWidth = "" + platform.width();
        this.chessLessons = "a1,a2,a3,a4,a5,a6,a7,a8/a7,b7,c7,d7,e7,f7,g7,h7/d1,d2,d3,d4,d5,d6,d7,d8/a4,b4,c4,d4,e4,f4,g4,h4/h8,h7,h6,h5,h4,h3,h2,h1";

        this.graphicSetup = "276px,34.5px,0,top,8/34.5px,276px,1,right,8/276px,34.5px,3,top,8/34.5px,276px,4,right,8/276px,34.5px,7,top,8";
        this.lesson = Math.floor(Math.random() * (1 + 4));
        this.lessonLeft = "0,1,2,3,4";

        const chessboard = document.getElementById("chessBoardComponent")

        this.createChessboard(chessboard)
    })
  }

  async getData() {
    const data = await this.storageService.getData();

    this.actualLessonData = data[2];
  }

  ngAfterViewInit() {
    this.getData();
  }

  async createChessboard(chessboard) {
    const arrayOfTiles = chessboard.children;

    for(let i =0; i < 64; i++){
      let index1 = String.fromCharCode(Math.floor(i/8) + 97);
      let index2 = 9 - ((i%8) + 1);

      const size = parseInt(this.screenWidth) / 8;

      //tile.style.backgroundColor = ( (i + Math.floor(i/8)) % 2 == 0) ? "#BAA378" : "rgb(97, 84, 61)" ;

      arrayOfTiles[i].id = index1+index2;
      
      this.tileClickListener = this.renderer.listen(arrayOfTiles[i], "click", event => {
        this.checkIfCorrect(event);
      })

    }
    //this.lesson
    this.setupLesson(this.lesson);
  }

  async setupLesson(lessonIndex) {
    const setupArray = this.graphicSetup.split("/")[this.lesson].split(",");
    this.actualLesson = this.chessLessons.split("/")[this.lesson];
    this.standardArrayOfLessons = this.chessLessons.split("/")[this.lesson];
    
    const lessonsLeftArray = this.lessonLeft.split(",");
    lessonsLeftArray.splice(lessonIndex, 1);
    this.lessonLeft = lessonsLeftArray.toString()

    this.createShitLine(setupArray[0], setupArray[1], setupArray[2], setupArray[3],setupArray[4]);
  }





  createShitLine(height, width, top, orientation, length ) {
    const chessboard = document.getElementById("chessboard");
    const line = document.createElement("div");

    line.style.width = width;
    line.style.height = height;
    if(orientation == "right")
      line.style.top = (top * 34.5 + 130) + "px";
      else {
        line.style.left = (top * 34.5) + "px";
      }
    line.style.position = "absolute";
    line.style.overflow = "hidden";
    line.style.pointerEvents = "none";

    chessboard.append(line)

    for(let i =0; i<length; i++){
      const tile = document.createElement('ion-icon');

      if(orientation == "top")
        tile.name = "ellipsis-vertical-outline";
      else if(orientation == "right")
        tile.name = "ellipsis-horizontal-outline";

      tile.style.width = "34.5px";
      tile.style.height = "34.5px";

      tile.style.pointerEvents = "none";

      line.append(tile)
    }
  }


  async checkIfCorrect(e) {
    const target = e.target;
    const clickedTile = e.target.id;
    const resultsArray = this.actualLesson.split(',');

    target.style.display = "flex";
    target.style.justifyContent = "center";
    target.style.alignItems = "center";
    

    if(resultsArray.includes(clickedTile)){
      const index = resultsArray.indexOf(clickedTile);
      resultsArray.splice(index,1);

      this.selectCorrectTile(e.target); 
    }
    else if(!this.standardArrayOfLessons.includes(clickedTile)) {
      this.selectWrongTile(e.target);
    }

    this.actualLesson = resultsArray.toString();
    if(this.actualLesson == "")
    {
      if(this.lessonLeft.length >= 1)
        this.handleTheEndOfLesson();
      else
        this.handleTheEndOfFullChapter();
    }
  }

  selectCorrectTile(target) {
    const greenTile = document.createElement("div");

    greenTile.style.width = "31.5px";
    greenTile.style.height = "31.5px";
    greenTile.style.borderRadius = "10px";
    greenTile.style.backgroundColor = "rgba(0,230,0, 0.6)";

    target.appendChild(greenTile);
    
  }

  selectWrongTile(target) {
    const redTile = document.createElement('div');

    redTile.style.width = "31.5px";
    redTile.style.height = "31.5px";
    redTile.style.borderRadius = "10px";
    redTile.style.backgroundColor = "rgba(230,0,0, 0.6)";

    target.appendChild(redTile);

  }

  async handleTheEndOfLesson() {
    await this.nextLesson();
  }

  async handleTheEndOfFullChapter() {
    const alert = await this.alertController.create({
      header:"Gratulacje Mistrzuniu !!!",
      message: "Ukończyłeś cały rozdział"
    })

    await alert.present();
    await this.destroyAllChildren();
    await this.updateActualLessonData();
  }

  async nextLesson() {
    const lessonsLeftArray = this.lessonLeft.split(',');
    const length = lessonsLeftArray.length;
    
    const randNumber = Math.floor(Math.random() * (length)); 
    this.lesson = parseInt(lessonsLeftArray[randNumber]);

    await this.destroyAllChildren();
    await this.setupLesson(randNumber);
  
  }

  async destroyAllChildren() {
    const chessboard = document.getElementById("chessboard");
    const chessboardChild = chessboard.children[0];

    chessboard.removeChild(chessboardChild);
    
    const chessBoardComponentChildren = document.getElementById("chessBoardComponent").children;
    
    Array.from(chessBoardComponentChildren).forEach( child => {
      if(child.children.length != 0){
        const coloredTile = child.children[0];
        child.removeChild(coloredTile);
      }
    });

  }

  async updateActualLessonData() {
    const lessonData = this.actualLessonData;

    lessonData.isActualLessonDone = true;
    await this.storageService.updateData(lessonData, 2);
  }


  ngOnDestroy() {
    this.tileClickListener();
  }

}
