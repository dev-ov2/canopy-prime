import { ReactNode } from 'react'
import { Keyboard, Mousewheel, Navigation, Pagination } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/react'

// Import Swiper styles
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
import { LuX } from 'react-icons/lu'

type OnboardingProps = {
  open: boolean
  setOpen: (open: boolean) => void
  setLandingOpen: (open: boolean) => void
}

type SlideProps = {
  title: string
  description: string
  image: string
  action?: ReactNode
}

const Slide = ({ title, description, image, action }: SlideProps) => {
  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center px-6 text-center">
      <div className="absolute top-0 flex flex-col items-center">
        <h2 className="text-3xl font-semibold text-white">{title}</h2>
        <div className="mt-8" />
        <img
          src={image}
          alt={title}
          className="h-[30vw] max-h-[480px] rounded-2xl object-contain shadow-[0_0_10px_5px_rgba(6,6,6,1)]"
        />
        <p className="mt-8 w-[40vw] whitespace-pre-wrap text-base text-white/80">{description}</p>
      </div>
      {action ? <div className="absolute bottom-4 right-4 z-10">{action}</div> : null}
    </div>
  )
}

const Onboarding = ({ open, setOpen, setLandingOpen }: OnboardingProps) => {
  if (!open) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex h-screen w-screen items-center justify-center">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div className="relative z-10 flex h-[90vh] w-[90vw] max-w-6xl flex-col overflow-hidden rounded-3xl bg-linear-to-b from-[#111111] to-[#222222] p-6 text-white shadow-2xl">
        <button
          type="button"
          className="z-80 absolute right-6 top-6 flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white transition hover:bg-white/30 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
          onClick={() => setOpen(false)}
          aria-label="Close onboarding"
        >
          <div>
            <LuX />
          </div>
        </button>
        <div className="flex h-full w-full">
          <Swiper
            cssMode
            navigation
            pagination={false}
            mousewheel
            keyboard
            modules={[Navigation, Pagination, Mousewheel, Keyboard]}
            className="h-full w-full"
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
                  <button
                    type="button"
                    onClick={() => {
                      setOpen(false)
                      setLandingOpen(false)
                    }}
                    className="rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:bg-emerald-400 focus-visible:ring-2 focus-visible:ring-emerald-200 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
                  >
                    Let's go!
                  </button>
                }
              />
            </SwiperSlide>
          </Swiper>
        </div>
      </div>
    </div>
  )
}

export default Onboarding
