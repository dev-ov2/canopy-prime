import { Keyboard, Mousewheel, Navigation, Pagination } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/react'

// Import Swiper styles
import { Box, Button, CloseButton, Dialog, Image, Spacer, Text, VStack } from '@chakra-ui/react'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import Statistics from './CanopyStatistics.png'
import FAQ from './FAQ.png'
import Login from './Login.png'
import Providers from './Providers.png'
import './swiper.css'
import Triggers from './Triggers.png'
import YourProgress from './YourProgress.png'

type OnboardingProps = {
  open: boolean
  setOpen: (open: boolean) => void
  setLandingOpen: (open: boolean) => void
}

type SlideProps = {
  title: string
  description: string
  image: string
  action?: React.ReactNode
}

const Slide = (props: SlideProps) => {
  return (
    <Box w="100%" h="100%">
      <VStack direction="column" align="center" justify="center">
        <Text textStyle="2xl">{props.title}</Text>
        <Spacer h={8} />
        <Image boxShadow={'0px 0px 10px 5px #060606'} h={'30vw'} src={props.image} />

        <Text whiteSpace={'pre-wrap'} w={'40vw'}>
          {props.description}
        </Text>
      </VStack>
      <Box position="absolute" bottom={2} right={2} zIndex={99}>
        {props.action}
      </Box>
    </Box>
  )
}

const Onboarding = ({ open, setOpen, setLandingOpen }: OnboardingProps) => {
  return (
    <Dialog.Root lazyMount open={open} onOpenChange={(e: any) => setOpen(e.open)} size="full">
      <Dialog.Trigger />
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <Dialog.Content>
          <Dialog.CloseTrigger>
            <CloseButton size="sm" />
          </Dialog.CloseTrigger>
          <Dialog.Header>
            <Dialog.Title />
          </Dialog.Header>
          <Dialog.Body
            style={{
              display: 'flex',
              background: 'linear-gradient(#111111, #222222)',
            }}
          >
            <Box w="100%" flex="1">
              <Swiper
                cssMode={true}
                navigation={true}
                pagination={false}
                mousewheel={true}
                keyboard={true}
                modules={[Navigation, Pagination, Mousewheel, Keyboard]}
              >
                <SwiperSlide>
                  <Slide
                    title="Log in"
                    description="To access Canopy's features and functionalities, you will need to log in. You can press either button to log in."
                    image={Login}
                  />
                </SwiperSlide>
                <SwiperSlide>
                  <Slide
                    title="Choose Provider"
                    description={`When you log in, you'll be able to log in via Google or by using your phone number.\n\nWe will not use your phone number or email for any other purposes than to log you in.`}
                    image={Providers}
                  />
                </SwiperSlide>
                <SwiperSlide>
                  <Slide
                    title="Your Progress"
                    description={`The first screen you will see is your progress screen.\n\nHere, you'll see your progress towards planting a new tree, how many trees you have planted, and how many points you've earned since installing Canopy. This will automatically update as you use Canopy and earn points.\n\nYou can also view the sidebar, which lists all available games currently supported by Canopy.`}
                    image={YourProgress}
                  />
                </SwiperSlide>
                <SwiperSlide>
                  <Slide
                    title="Canopy Statistics"
                    description={`The Canopy Statistics page will give you at-a-glance updates to how well Canopy is doing in terms of planting trees and how many trees have been planted by the community.\n\nThis screenshot is a demo page, and does not reflect actual performance.\n\nWe also explain a little bit about Canopy as a whole.\n\nYou can find more information about Canopy in the FAQ section.`}
                    image={Statistics}
                  />
                </SwiperSlide>
                <SwiperSlide>
                  <Slide
                    title="Triggers"
                    description={`If you click on one of the supported games (in this case, Halo Infinite), you will have a new tab at the top of the screen named 'Game Triggers'. This is where you can see all the triggers available for the game you are playing.\n\nYou can see how many times you have completed a trigger and how many points you have earned that way.\n\nNot all games will have trigger information listed here, such as games that have dynamic triggers.`}
                    image={Triggers}
                  />
                </SwiperSlide>
                <SwiperSlide>
                  <Slide
                    title="FAQ"
                    description={`That's it! Simple, right?\n\nIf you have any questions, you can check out the FAQ section for more information.\n\nIf you have any other questions, you can join our Discord server and ask there.\n\nThank you for using Canopy!`}
                    image={FAQ}
                    action={
                      <Button
                        onClick={() => {
                          setOpen(false)
                          setLandingOpen(false)
                        }}
                      >
                        Let's go!
                      </Button>
                    }
                  />
                </SwiperSlide>
              </Swiper>
            </Box>
          </Dialog.Body>
          <Dialog.Footer />
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  )
}

export default Onboarding
