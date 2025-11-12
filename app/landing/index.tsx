import { ReactNode, useEffect, useState } from 'react'

import DiscordLogoWhite from '@/resources/assets/DiscordLogoWhite.png'
import GetStarted from '@/resources/assets/GetStarted.png'
import GoTo from '@/resources/assets/GoTo.png'
import Overview from '@/resources/assets/Overview.webp?asset'
import Settings from '@/resources/assets/Settings.png?asset'
import { LuCirclePlay, LuExternalLink, LuX } from 'react-icons/lu'

import { FaDiscord } from 'react-icons/fa'
import { MUIcon } from '@/app/components/ui/MUIcon'
import Onboarding from './onboarding'
import SettingsModal from './settings'
import { useConveyor } from '../hooks/use-conveyor'

export const DISCORD_URL = 'https://discord.gg/PD99F6Rvcy'

type ButtonProps = {
  icon: ReactNode
  onClick: () => void
}

const Button = (props: ButtonProps) => {
  return (
    <button
      type="button"
      onClick={props.onClick}
      className="flex h-10 w-10 items-center justify-center rounded-full text-black transition-colors hover:bg-white/90 hover:text-black focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-black"
    >
      {props.icon}
    </button>
  )
}

type LandingCardProps = {
  image: string | ReactNode
  title: string
  description: string
  action?: ReactNode
  onClick?: () => void
}

const LandingCard = (props: LandingCardProps) => {
  return (
    <div
      onClick={props.onClick}
      className={`relative flex h-[30vh] min-h-80 w-[15vw] min-w-[180px] flex-col overflow-hidden rounded-lg bg-black/90 p-0 shadow-lg transition-transform duration-150 ease-in-out ${
        props.onClick ? 'cursor-pointer hover:scale-[1.05]' : ''
      }`}
    >
      {typeof props.image === 'string' ? (
        <img
          draggable={false}
          src={props.image}
          alt={props.title}
          className="h-[12vh] w-full select-none object-cover"
        />
      ) : (
        props.image
      )}
      <div className="user-select-none px-5 pb-5 pt-4">
        <h3 className="text-lg font-semibold text-white">{props.title}</h3>
        <p className="mt-2 text-sm text-white/70">{props.description}</p>
      </div>
      <div className="absolute bottom-2 right-2">{props.action}</div>
    </div>
  )
}

type LandingProps = {
  open: boolean
  setOpen: (open: boolean) => void
  hasUpdate: boolean
}

const Landing = ({ open, setOpen, hasUpdate }: LandingProps) => {
  const app = useConveyor('app')
  const [onboarding, setOnboarding] = useState<boolean>(false)
  const [settingsOpen, setSettingsOpen] = useState<boolean>(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouseMove = (event: globalThis.MouseEvent) => {
      setMousePosition({
        x: event.clientX,
        y: event.clientY,
      })
    }

    window.addEventListener('mousemove', handleMouseMove)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [])

  const getParallaxStyle = () => {
    const { x, y } = mousePosition
    const moveX = (x / window.innerWidth - 0.5) * 5 // Adjust multiplier as needed
    const moveY = (y / window.innerHeight - 0.5) * 5 // Adjust multiplier as needed
    return {
      backgroundPosition: `calc(50% + ${moveX}px) calc(50% + ${moveY}px)`,
    }
  }

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-50 flex h-screen w-screen items-center justify-center">
          <div
            className="fixed inset-0 -z-10 bg-cover bg-fixed"
            style={{
              backgroundImage: `url(${Overview})`,
              filter: 'brightness(1) blur(8px)',
              ...getParallaxStyle(),
            }}
          />
          <div className="absolute inset-0 bg-black/45 backdrop-blur" />
          <button
            type="button"
            className="flex h-8 w-8 items-center justify-center z-80 absolute right-6 top-6 rounded-full bg-black/80 px-3 py-1 text-sm font-medium text-white shadow-md transition hover:bg-black/50 cursor-pointer"
            onClick={() => setOpen(false)}
          >
            <div>
              <LuX />
            </div>
          </button>

          <div className="relative z-10 flex h-full w-full items-center justify-center p-6">
            <div className="flex flex-col items-center gap-8 text-center">
              <div className="flex flex-col items-center gap-2">
                <span className="text-4xl font-semibold uppercase tracking-[0.2em] text-white drop-shadow-[0_0_16px_rgba(255,255,255,1)]">
                  Hello!
                </span>
                <p className="max-w-xl text-lg font-semibold text-white/80 drop-shadow-[0_0_16px_rgba(255,255,255,1)]">
                  Welcome to Canopy! Here are a few things you can do to begin:
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-6">
                <LandingCard
                  title={'Get Started'}
                  description="Learn the ropes of Canopy"
                  image={GetStarted}
                  action={<Button icon={<LuCirclePlay />} onClick={() => setOnboarding(true)} />}
                  onClick={() => setOnboarding(true)}
                />
                <LandingCard
                  title={'Go To App'}
                  description="Head to the main app and start using Canopy to earn points and plant trees"
                  image={GoTo}
                  action={<Button icon={<LuExternalLink />} onClick={() => setOpen(false)} />}
                  onClick={() => setOpen(false)}
                />
                <LandingCard
                  title={'Join the Discord'}
                  description="Get the latest updates about newly supported games, upcoming features, submit valuable feedback and more."
                  image={
                    <div className="relative h-[12vh] w-full">
                      <img
                        src={Overview}
                        alt="Discord teaser background"
                        className="h-full w-full rotate-180 object-cover brightness-[0.4] blur-sm"
                      />
                      <img
                        src={DiscordLogoWhite}
                        alt="Discord logo"
                        className="absolute inset-x-[10%] top-0 h-[12vh] w-[80%] object-contain"
                      />
                    </div>
                  }
                  action={
                    <Button
                      icon={<FaDiscord />}
                      onClick={() => {
                        app.openExternalLink(DISCORD_URL)
                      }}
                    />
                  }
                  onClick={() => {
                    app.openExternalLink(DISCORD_URL)
                  }}
                />
                <LandingCard
                  title={'Open Settings'}
                  description="Customize your Canopy experience"
                  image={<img src={Settings} alt="Settings" className="h-[12vh] w-full object-cover" />}
                  action={
                    <Button
                      icon={<MUIcon icon="settings" />}
                      onClick={() => {
                        setSettingsOpen(true)
                      }}
                    />
                  }
                  onClick={() => {
                    setSettingsOpen(true)
                  }}
                />
              </div>
            </div>
            {hasUpdate && (
              <div className="absolute right-4 top-4 z-20">
                <div className="flex items-center gap-4 rounded-xl bg-yellow-400/90 px-5 py-4 text-black shadow-lg">
                  <div className="h-2 w-2 rounded-full bg-black" />
                  <div className="flex flex-col text-left">
                    <span className="font-bold">Update Available</span>
                    <span className="text-sm">An app update was detected. Would you like to restart now?</span>
                  </div>
                  <button
                    type="button"
                    className="rounded-full px-4 py-2 text-sm font-medium transition hover:bg-black/10"
                    onClick={() => {
                      app.restartApp()
                    }}
                  >
                    Update and Relaunch
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      <Onboarding
        open={onboarding}
        setOpen={setOnboarding}
        setLandingOpen={(open) => {
          setOpen(open)
        }}
      />
      <SettingsModal open={settingsOpen} setOpen={setSettingsOpen} />
    </>
  )
}

export default Landing
