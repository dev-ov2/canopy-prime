import {
  Alert,
  Box,
  Card,
  Dialog,
  HStack,
  IconButton,
  Image,
  Text,
  Button as ChakraButton,
  VStack,
} from '@chakra-ui/react'
import { ReactNode, useEffect, useState } from 'react'

import DiscordLogoWhite from '@/resources/assets/DiscordLogoWhite.png'
import GetStarted from '@/resources/assets/GetStarted.png'
import GoTo from '@/resources/assets/GoTo.png'
import Overview from '@/resources/assets/Overview.webp?asset'
import Settings from '@/resources/assets/Settings.png?asset'
import { LuCirclePlay, LuExternalLink } from 'react-icons/lu'

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
    <IconButton
      _hover={{ background: 'white', color: 'black' }}
      variant="ghost"
      borderRadius="full"
      onClick={props.onClick}
    >
      {props.icon}
    </IconButton>
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
    <Card.Root
      minH={320}
      h={'30vh'}
      minW={180}
      w={'15vw'}
      overflow="hidden"
      onClick={props.onClick}
      _hover={{
        transform: 'scale(1.05)',
        transition: 'transform 0.15s ease-in-out',
      }}
      transition="transform 0.15s ease-in-out"
      cursor={props.onClick ? 'pointer' : undefined}
    >
      {typeof props.image === 'string' ? (
        <Image draggable={false} userSelect="none" src={props.image} w="100%" h="12vh" fit="cover" />
      ) : (
        props.image
      )}
      <Card.Header userSelect="none">
        <Card.Title>{props.title}</Card.Title>
        <Card.Description>{props.description}</Card.Description>
      </Card.Header>
      <Box position="absolute" bottom={2} right={2}>
        {props.action}
      </Box>
    </Card.Root>
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
    const handleMouseMove = (event: MouseEvent) => {
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
      <Dialog.Root lazyMount open={open} onOpenChange={(e: any) => setOpen(e.open)} size="full" closeOnEscape={false}>
        <Dialog.Trigger />
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.CloseTrigger />
            <Dialog.Header>
              <Dialog.Title />
            </Dialog.Header>

            <Dialog.Body display="flex" justifyContent="center" alignItems="center">
              <Box
                position="fixed"
                top="0"
                left="0"
                padding={0}
                w="100%"
                h="100%"
                bgImage={`url(${Overview})`}
                backgroundSize="cover"
                backgroundAttachment={'fixed'}
                filter="brightness(1) blur(8px)"
                style={getParallaxStyle()}
                zIndex={-1}
              />
              <VStack justifyItems={'center'}>
                <VStack>
                  <Text textStyle="3xl" letterSpacing={2} color="black" textShadow="0px 0px 16px #fff">
                    Hello!
                  </Text>
                  <Text color="black" fontWeight="600" textStyle="xl" textShadow="0px 0px 16px #fff">
                    Welcome to Canopy! Here are a few things you can do to begin:
                  </Text>
                </VStack>
                <HStack>
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
                      <Box position="relative">
                        <Image
                          src={Overview}
                          w="100%"
                          h="12vh"
                          fit="cover"
                          filter="blur(3px) brightness(0.4)"
                          transform="rotate(180deg)"
                        />
                        <Image
                          top={0}
                          left={'10%'}
                          right={'10%'}
                          position="absolute"
                          src={DiscordLogoWhite}
                          w="80%"
                          h="12vh"
                          fit="contain"
                        />
                      </Box>
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
                    image={
                      <Box position="relative">
                        <Image src={Settings} w="100%" h="12vh" />
                      </Box>
                    }
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
                </HStack>
              </VStack>
              {hasUpdate && (
                <Box zIndex={1000} position="absolute" top={4} right={4}>
                  <Alert.Root status="info" variant="solid" color="black" bgColor="gold">
                    <Alert.Indicator color="black" />
                    <Alert.Content>
                      <Alert.Title fontWeight="bold">Update Available</Alert.Title>
                      <Alert.Description color="black">
                        An app update was detected. Would you like to restart now?
                      </Alert.Description>
                    </Alert.Content>
                    <ChakraButton
                      zIndex={24}
                      variant="ghost"
                      color="black"
                      alignSelf="center"
                      _hover={{
                        bgColor: 'white',
                      }}
                      fontWeight="medium"
                      onClick={() => {
                        app.restartApp()
                      }}
                    >
                      Update and Relaunch
                    </ChakraButton>
                  </Alert.Root>
                </Box>
              )}
            </Dialog.Body>
            <Dialog.Footer />
          </Dialog.Content>
        </Dialog.Positioner>
      </Dialog.Root>
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
