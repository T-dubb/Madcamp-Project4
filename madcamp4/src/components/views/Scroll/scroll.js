import styled from 'styled-components'
import React, { useState, useEffect } from "react"
import axios from "axios"
import { withRouter, useHistory } from "react-router-dom";
import "./scroll.css"
import spade from './spade.png'
import gameicon from './cube.png'
import { useSpring, a } from '@react-spring/web'
import Fab from '@material-ui/core/Fab';
import AddIcon from '@material-ui/icons/Add';
import { makeStyles } from '@material-ui/core/styles';
import { Canvas } from "@react-three/fiber";
import { Stars, Html } from "@react-three/drei";
import {useSelector} from 'react-redux'
import vert from "./vert.png"
import menu from "./menu.png"
import exit from "./exit.png"
import prev from "./leftarrow.png"
import re from "./refresh.png"


const H1 = styled.h1`
  text-align: center;
  margin: 0;
  padding-bottom: 5rem;
`

const Relative = styled.div`
  position: relative;
`

const Flex = styled.div`
  display: flex;
  align-items: center;
`

const HorizontalCenter = styled(Flex)`
  justify-content: center;
  align-items:center;
  margin-left: auto;
  margin-right: auto;
  max-width: 64rem;
`


// const Item = styled.div`
//   color: white;
//   font-size: 2rem;
//   //text-transform: capitalize;

//   width: ${({size}) => `${20}rem`};
//   height: ${({size}) => `${30}rem`};

//   display: flex;

// //   align-items: center;
// //   justify-content: center;
// `

function getPrevElement(list) {
  const sibling = list[0].previousElementSibling
  
  if (sibling instanceof HTMLElement) {
    return sibling
  }

  return sibling
}

function getNextElement(list) {
  const sibling = list[list.length - 1].nextElementSibling

  if (sibling instanceof HTMLElement) {
    return sibling
  }

  return null
}

function usePosition(ref) {
  const [prevElement, setPrevElement] = React.useState(null)
  const [nextElement, setNextElement] = React.useState(null)

  React.useEffect(() => {
    const element = ref.current

    const update = () => {
      const rect = element.getBoundingClientRect()
     
      const visibleElements = Array.from(element.children).filter((child) => {
        const childRect = child.getBoundingClientRect()
        

        return childRect.left >= rect.left && childRect.right <= rect.right
      })

      if (visibleElements.length > 0) {
        setPrevElement(getPrevElement(visibleElements))
        setNextElement(getNextElement(visibleElements))
      }
    }

    update()

    element.addEventListener('scroll', update, {passive: true})

    return () => {
      element.removeEventListener('scroll', update, {passive: true})
    }
  })

  const scrollToElement = React.useCallback(
    (element) => {
      const currentNode = ref.current

      if (!currentNode || !element) return

      let newScrollPosition

      newScrollPosition =
        element.offsetLeft +
        element.getBoundingClientRect().width / 2 -
        currentNode.getBoundingClientRect().width / 2

      currentNode.scroll({
        left: newScrollPosition,
        behavior: 'smooth',
      })
    },
    [ref],
  )

  const scrollRight = React.useCallback(() => scrollToElement(nextElement), [
    scrollToElement,
    nextElement,
  ])

  const scrollLeft = React.useCallback(() => scrollToElement(prevElement), [
    scrollToElement,
    prevElement,
  ])

  return {
    hasItemsOnLeft: prevElement !== null,
    hasItemsOnRight: nextElement !== null,
    scrollRight,
    scrollLeft,
  }
}

const CarouserContainer = styled.div`
  overflow: hidden;
`

 const CarouselItem = styled.div`
  flex: 0 0 auto;

  margin-left: 1.5rem;
`

 const CarouselButton = styled.button`
  position: absolute;
  
  cursor: pointer;

  top: 50%;
  z-index: 1;

  transition: transform 0.1s ease-in-out;

  background: black;
  border-radius: 30px;
  border: none;
  padding: 0.5rem;
`
 const LeftCarouselButton = styled(CarouselButton)`
  left: 0;
  transform: translate(0%, -50%);

  // ${CarouserContainer}:hover & {
  //   transform: translate(0%, -50%);
  // }

  visibility: ${({hasItemsOnLeft}) => (hasItemsOnLeft ? `all` : `hidden`)};
`

 const RightCarouselButton = styled(CarouselButton)`
  right: 0;
  transform: translate(0%, -50%);

  // ${CarouserContainer}:hover & {
  //   transform: translate(0%, -50%);
  // }

  visibility: ${({hasItemsOnRight}) => (hasItemsOnRight ? `all` : `hidden`)};
`

 const CarouserContainerInner = styled(Flex)`
  overflow-x: scroll;
  scroll-snap-type: x mandatory;
  -ms-overflow-style: none;
  scrollbar-width: none;

  // offset for children spacing
  margin-left: -1rem;
  margin-top: 40px;

  &::-webkit-scrollbar {
    display: none;
  }

  ${CarouselItem} & {
    scroll-snap-align: center;
  }
`

const ArrowLeft = ({size = 40, color = '#fff'}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M19 12H6M12 5l-7 7 7 7" />
  </svg>
)


const ArrowRight = ({size = 40, color = '#fff'}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M5 12h13M12 5l7 7-7 7" />
  </svg>
)


function Carousel({children, joinRoom}) {
  const ref = React.useRef()
  const [rooms, setRooms] = useState([])

  const {
    hasItemsOnLeft,
    hasItemsOnRight,
    scrollRight,
    scrollLeft,
  } = usePosition(ref)

  return (
    <CarouserContainer>
      <CarouserContainerInner ref={ref}>
        {React.Children.map(children, (child, index) => (
          <CarouselItem key={index} >{child}</CarouselItem>
        ))}
      </CarouserContainerInner>
      <LeftCarouselButton hasItemsOnLeft={hasItemsOnLeft} onClick={scrollLeft}>
        <ArrowLeft />
      </LeftCarouselButton>
      <RightCarouselButton
        hasItemsOnRight={hasItemsOnRight}
        onClick={scrollRight}
      >
        <ArrowRight />
      </RightCarouselButton>
    </CarouserContainer>
  )
}

const useStyles = makeStyles((theme) => ({
  margin: {
    margin: theme.spacing(4),
    borderRadius: "30px",
    width: "320px",
    height: "57px",
    color: "white",
    backgroundColor: "indigo",
    fontSize: "20px",
    fontFamily: "futura"
  },
  extendedIcon: {
    marginRight: theme.spacing(1),
  },
  logout: {
    position: "absolute",
    bottom: "10%",
    right: "3%",
    alignItems: "center",
    justifyContent: 'center',
    color: "white",
    backgroundColor: "gray",
    fontSize: "15px",
    fontFamily: "futura",
  },
  undo: {
    position: "absolute",
    bottom: "20%",
    right: "3%",
    alignItems: "center",
    justifyContent: 'center',
    color: "white",
    backgroundColor: "gray",
    fontSize: "15px",
    fontFamily: "futura",
  },
  refresh: {
    position: "absolute",
    bottom: "30%",
    right: "3%",
    alignItems: "center",
    justifyContent: 'center',
    color: "white",
    backgroundColor: "gray",
    fontSize: "15px",
    fontFamily: "futura",
  },
}));

function Scroll(props) {
  let history = useHistory()
  const user = useSelector(state => state.user)
  const [rooms, setRooms] = useState([])
  const colors = [
    { name: "Kelly", people: 6, id: 'A'},
    { name: "ChanYoung", people: 6, id: 1},
    { name: "Tobby", people: 6, id: 2},
    { name: "Tobby", people: 6, id: 3},
    { name: "Tobby", people: 6, id: 4},
    { name: "Tobby", people: 6, id: 4},
    { name: "Tobby", people: 6, id: 4},
    { name: "Tobby", people: 6, id: 4},
    { name: "Tobby", people: 6, id: 11},
  ]
  useEffect(() => {
        axios.get('/api/gameroom/getAllrooms2')
        .then((res) => {
            console.log(res.data);
            setRooms(res.data);
        })
    }, [])
  //let history = useHistory()
  
  const classes = useStyles();
  const [flipped, set] = useState(true)
  const [roomName, setRoomName] = useState('')
  //const [open, setOpen] = React.useState(false);

  const NewRoom = () => {
    set(state => !state)
    console.log(roomName);
    console.log(user.userData)
    //socket으로 text 쏴주면 될듯
    axios.post('/api/gameroom/addRoom', {roomName: 'roomname', user: user.userData})
    .then(res => {
      setRoomName('');
      setTimeout(() => {
        history.push(`/gamepage/${res.data}`)
      }, 1500);
    })
    
  };

  function joinRoom (index) {
    set(state => !state)
    console.log("인덱스", index)
    console.log("여기에 룸아이디와야함!", rooms)
    axios.post('/api/gameroom/joinRoom', {roomId: rooms[index]._id, playerId: user.userData?._id})
    setTimeout(() => {
      history.push(`/gamepage/${rooms[index]._id}`)
    }, 1000);
  }

  const logout= () => {
    axios.get('api/user/logout')
    .then(response => {
        if (response.data.ok) {
            alert('로그아웃되었습니다.')
            props.history.push('/login')
        }
    })
  }
  const undo= () => {
    props.history.push('/')
  }

  const refresh = () => {
    axios.get('/api/gameroom/getAllrooms2')
        .then((res) => {
            console.log(res.data);
            setRooms(res.data);
        })
  }

  const { transform, opacity } = useSpring({
    opacity: 1,
    transform: `perspective(500px) rotateY(${flipped ? 360 : 180}deg)`,
    config: { mass: 5, tension: 500, friction: 80 },
  })

  const colorsArray = rooms.map((color,index) => (
    <div class="outer" onClick={() => {joinRoom(index)}} value={index}
      >
    {
      flipped
      ? <a.div class="front" 
        style={{  transform, borderRadius: '20px'}}
      >
        <span class="inner" > {color.id} </span>
        <span class="spade">
        <img src={ spade } width='32' height='32' />
        </span>
        <span class="username" > {color.name} </span>
        
        <span class="gameicon">
        <img src={ gameicon } width='52' height='52' />
        </span>
    
        <span class="people" > {color.people} / 6 </span>
        <span class="spade2">
        <img src={ spade } width='32' height='32' />
        </span>
        <span class="end"> {color.id} </span>
      </a.div>
      : <a.div
        class="back"
        style={{
          transform,
          borderRadius: '20px',
          rotateY: '180deg',
        }}
      />
    }
    </div>
  ))
  return (
  
    <Canvas>
        <Stars
          radius={100}
          depth={50}
          count={5000}
          factor={4}
          saturation={0}
          fade
        />
        <Html as='div' className="Container" fullscreen="true" >
          <h1 className="title"> MINUS AUCTION </h1>
          <div class="animate-container">
          <div class="spaceship-full">
            <div class="spaceship-container">
              <div class="spaceship">
                <span class="top"></span>
                <span class="midle"></span>
                <span class="bottom"></span>
              </div>
              <div class="light-perspective">
                <span class="light"></span>
              </div>
            </div>
          </div>
        </div>
          <HorizontalCenter style={{zIndex: 0}}>
          {/* <a href="/gamepage" style={{ textDecoration: 'none', color: "black" }} > */}
            <Carousel joinRoom={joinRoom} rooms={rooms} >{colorsArray}</Carousel>
            
            {/* <Carousel><colorsArray2 joinRoom={joinRoom} rooms={rooms}/></Carousel> */}
          </HorizontalCenter>
          
          <div className="plus2">
          {/* <a href="/gamepage" style={{ textDecoration: 'none', color: "black" }} > */}
          <Fab variant="extended" onClick={NewRoom} className={classes.margin} >
            <AddIcon className={classes.extendedIcon}/>
            New room
          </Fab>
          </div> 

          <div id="container-floating">
     
            <div onClick={undo} class="nd4 nds" data-toggle="tooltip" data-placement="left" data-original-title="contract@gmail.com">
              <img class="reminder"/>
              <img class="exit" src={ prev }/>
            </div>
            <div  onClick={logout}  class="nd3 nds" data-toggle="tooltip" data-placement="left" data-original-title="Reminder">
              <img class="reminder"/>
              <img class="exit" src={ exit }/>
            </div>
            <div onClick={refresh} class="nd1 nds" data-toggle="tooltip" data-placement="left" data-original-title="Edoardo@live.it">
              <img class="reminder"/>
              <img class="exit" src={ re }/>
            </div>

            <div id="floating-button" data-toggle="tooltip" data-placement="left" data-original-title="Create" onclick="newmail()">
              <img class="plus" src={ menu } />
              <img class="edit" src={ vert }/>
            </div>
          </div>

        
      </Html>
    </Canvas>
    
  )
}

export default withRouter(Scroll)