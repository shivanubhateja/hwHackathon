import React from 'react';

export class FloorPlan extends React.Component{

    componentDidMount() {
        const canvas = this.refs.canvas
        const ctx = canvas.getContext("2d")
        const img = this.refs.image;
        const locationImg = this.refs.locationImg;
        let pointer = "";
        let x = 800;
        let y = 800;
        img.onload = () => {
            ctx.drawImage(img, 0, 0,  canvas.width, canvas.height)
            ctx.drawImage(locationImg, 90, 90, 0, 0);
          ctx.drawImage(locationImg, 90, 90, 50, 50);  
          this.translateHelper(img, locationImg, x, y, ctx, canvas)
          }
      }

      translateHelper = (img, locationImg,x, y, ctx, canvas) => {
        this.translate(img, locationImg, x, y, ctx ,canvas).then(() => {
          x++;
          y++;
          if(x<900){
            this.translateHelper(img, locationImg, x, y, ctx, canvas);
          }
        })
      }
      translate = (img, locationImg, x, y, ctx, canvas) => {
        return new Promise((res) => {
          setTimeout(() => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0,  canvas.width, canvas.height)
            ctx.drawImage(locationImg, x, y, 50, 50);
            res();
          }, 100);
        })
      }
    render() {
        return(
          <div>
            <canvas ref="canvas" width={900} height={900} />
            <img ref="locationImg" src="./assets/loc.png" style={{display: "none"}} />
            <img ref="image" src="./assets/floorPlan.png" style={{display: "none"}} />
          </div>
        )
      }
    }