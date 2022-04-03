//          TEST CASE
/*
    1. render song ok
    2. scroll top ok    
    3. play / pause / seek(tua) ok  
    4. CD rotate ok 
    5. next / prev ok 
    6. random ok
    7. next / repeat when ended ok
    8. active song ok
    9. scroll active song into view
    10. playsong when clicked on
*/

const PLAYER_STORAGE_KEY = "NTN_PLAYER"

const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);
const player = $('.player');
const heading = $('h2');
const cdThumb = $('.cd-thumb');
const audio = $('#audio');
const cd = $('.cd');
const playBtn = $('.btn-toggle-play');
const progress = $('#progress');
const nextBtn = $('.btn-next');
const prevBtn = $('.btn-prev');
const randomBtn = $('.btn-random');
const repeatBtn = $('.btn-repeat');
const playlist = $('.playlist');

const app ={
    currentIndex: 0,
    isPlaying: false,
    isRandom: false,
    isRepeat: false,
    settings: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
    
    songs: [
        {
            name: "Đường tôi chở em về",
            singer: "buitruonglinh",
            path: '../../assets/music/song1.mp3',
            image: '../../assets/img/song1.jpg'
          },
          {
            name: "Người lạ thoáng qua",
            singer: "Thương Võ",
            path: '../../assets/music/song2.mp3',
            image: '../../assets/img/song2.jpg'
          },{
            name: "Yêu là cưới",
            singer: "Hương Ly",
            path: '../../assets/music/song3.mp3',
            image: '../../assets/img/song3.jpg'
          },{
            name: "Rồi tới luôn",
            singer: "Anh Khoa",
            path: '../../assets/music/song4.mp3',
            image: '../../assets/img/song4.jpg'
          },{
            name: "3107-2",
            singer: "FREAK D",
            path: '../../assets/music/song5.mp3',
            image: '../../assets/img/song5.jpg'
          },{
            name: "Dù cho mai về sau",
            singer: "buitruonglinh",
            path: '../../assets/music/song6.mp3',
            image: '../../assets/img/song6.jpg'
          },

    
      ],

    render: function() {
        //console.log(123);
        const htmls = this.songs.map((song,index) => {
                                //neu ma index = index cua app thi them active vao song
            return `
            <div class="song ${index === this.currentIndex ? 'active' : ''}" data-index="${index}">  
                  <div class="thumb"
                      style="background-image: url('${song.image}')">
                  </div>
                  <div class="body">
                      <h3 class="title">${song.name}</h3>
                      <p class="author">${song.singer}</p>
                  </div>
                  <div class="option">
                      <i class="fas fa-ellipsis-h"></i>
                  </div>
              </div>
                    `
        })
        playlist.innerHTML = htmls.join("");
    },

    //define ra thuoc tinh: giong nhu 1 phan tu function currentSong(),return app.songs[currentIndex] cua object
    defineProperties: function () {
        Object.defineProperty(this,'currentSong',{
           get: function(){
               return this.songs[this.currentIndex];
           } 
        })
    },
    
    handleEvents: function () {
        //tao ra 1 cai fake cua app
        const _this = this;

        //XU LY CD QUAY VA DUNG
        const cdThumbAnimate = cdThumb.animate([
            {transform: 'rotate(360deg '}
        ],{
            duration: 10000,    // 1 chu ki trog 10s
            iterations: Infinity, // quay lap lai bn lan
        })
        cdThumbAnimate.pause();// LUC DAU TIEN chua chay thi chua quay


        //XU LY KHI PHONG TO THU NHO CD
        const cdWidth = cd.offsetWidth;
        document.onscroll =function(){//lang nghe su kien keo con scrol tren document
            //de check toa do
            //console.log(window.scrollY);
            //console.log(document.documentElement.scrollTop);
            const scrollTop = window.scrollY;
            const newCdWidth = cdWidth - scrollTop; // width moi = width cu - scroll top
            cd.style.width = newCdWidth >0 ? newCdWidth + 'px' : 0;
            cd.style.opacity = newCdWidth / cdWidth;  //kich thc moi chia cho cu => mo dan  
        }

        //XU LY KHI CLICK NUT PLAY NHAC , sd api cua js audio
        playBtn.onclick = function (){
            if(_this.isPlaying){
                audio.pause(); // neu nhac dang chay, kick nut pause nhac se dung
            } else{
                audio.play();// nguoc lai
            }
            //Khi duoc kick play
            audio.onplay = function(){
                _this.isPlaying = true;
                player.classList.add('playing');
                cdThumbAnimate.play(); // khi bai hat chay thi cd quay
            }
            //Khi bi pause
            audio.onpause = function () {
                _this.isPlaying = false;
                player.classList.remove('playing');// chuyen nut play thanh pause
            cdThumbAnimate.pause();// luc dau chua chay thi chua quay
            }    
        
            //Khi tien do nhac thay do, lay ra % thoi gian chay
            audio.ontimeupdate = function () {
                //audio.duration la ham cho biet thoi gian chay het bai hat
                if(audio.duration){
                    //lay ra ti le % thoi gian da chay
                    const progressPercent = Math.floor(audio.currentTime / audio.duration *100);
                    progress.value = progressPercent;
                }
            }
    
            //Xu ly khi tua
            progress.onchange = function(e){
                const seekTime = audio.duration / 100 * e.target.value; // lay ra thoi gian thuc cua audio theo %
                audio.currentTime = seekTime;
            }
        }    

            //XU LY KHI NEXT, PREVIOUS
             nextBtn.onclick = function(){
                 if( _this.isRandom){   // Neu ma dang dung che do random
                     _this.randomSong();
                 } else {
                     _this.nextSong();
                 }
                audio.play();//bai hat chay lai tu dau, ko bi ke thua
                _this.render();// Khi next thi render lai de co active cho bai hat
                 _this.scrollToActiveSong();
            }
             prevBtn.onclick = function (){
                if( _this.isRandom){
                    _this.randomSong();
                } else {
                    _this.prevSong();
                }
                audio.play();
                _this.render();// Khi next thi render lai de co active cho bai hat

             }

             // XU LY click RANDOM BAI HAT
            randomBtn.onclick = function(e){
                _this.isRandom =! _this.isRandom;
                randomBtn.classList.toggle('active',_this.isRandom);
                // toggle : truyen 2 doi so , neu doi so thu2 la boolen true thi add, false thi remove  
            }

            //XU LY REPEAT BAI HAT
            repeatBtn.onclick = function(e){
                 _this.isRepeat =! _this.isRepeat;
                 repeatBtn.classList.toggle('active',_this.isRepeat);
                // toggle : truyen 2 doi so , neu doi so thu2 la boolen true thi add, false thi remove  
            }

            //XU LY nextSong khi audio ket thuc
            audio.onended = function(){     // SK khi bai hat ket thuc    
                nextBtn.click();    //tu dong click vao nextBtn 
            }

            //XU LY KHI CLICK VAO thanh BAI HAT
            playlist.onclick = function(e){
                //console.log(e.target); binh thuong bam vao dau se hien thi ra cai day,
                // Can phai click vao dau cua song cung dc
            const songNode = e.target.closest('.song:not(.active');

            // .closet la tra ve chinh no(e) hoac con cua no,hoac cha cua no
                if(songNode || e.target.closest('.option') ){
                    if(songNode){
                        //convert cai get index sang number
                        _this.currentIndex = Number(songNode.dataset.index);
                        _this.loadCurrentSong();
                        _this.render();
                        audio.play();
                    }    
                }
            
            }
        
    },  
    
    scrollToActiveSong: function () {
        setTimeout( ()=>{
            $('.song.active').scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
            });
        },500)

    },

    //load tra hinh anh, audio . ten cua currentsong
    loadCurrentSong: function () {
        heading.textContent = this.currentSong.name;
        cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`;
        audio.src = this.currentSong.path;

        //console.log(heading,cdThumb,audio);
    },

    nextSong: function () {
        this.currentIndex++;
        if(this.currentIndex >= this.songs.length) {
            this.currentIndex = 0;
        }
        this.loadCurrentSong();
    },
    prevSong: function () {
        this.currentIndex--;
        if(this.currentIndex < 0 ) {
            this.currentIndex = this.songs.length -1;
        }
        this.loadCurrentSong();
    },
    randomSong: function () {
        let newIndex;
        do {
            newIndex = Math.floor(Math.random() * this.songs.length); 
        } while( newIndex === this.currentIndex)
        this.currentIndex = newIndex;
        this.loadCurrentSong();    
    },

    // tao function de bat dau app
    start : function () {
        //DInh nghia cac thuoc tinh cho object
        this.defineProperties();

        //Lang nghe cac su kien
        this.handleEvents();
        
        //Tai thong tin bai hat dau tien vao UI khi chay ung dung
        this.loadCurrentSong();

        //render ra playlist
        this.render();
    }
}

app.start();






















































